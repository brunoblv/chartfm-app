/**
 * Build local do AAB de produção.
 * Baixa a keystore de upload do EAS (não gasta cota) e roda gradle bundleRelease.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const androidDir = path.join(root, "android");
const appDir = path.join(androidDir, "app");
const keystorePath = path.join(appDir, "chartfm-upload.keystore");
const propsPath = path.join(androidDir, "keystore.properties");
const outDir = path.join(root, "dist");
const outAab = path.join(outDir, "chartfm-1.0.1.aab");
const androidHome = "C:\\Users\\blvbr\\AppData\\Local\\Android\\Sdk";
const javaHomeCandidates = [
  "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.101-hotspot",
  process.env.JAVA_HOME,
  "C:\\Program Files\\Android\\Android Studio\\jbr",
].filter(Boolean);

function resolveJavaHome() {
  for (const candidate of javaHomeCandidates) {
    const release = path.join(candidate, "release");
    const javaBin = path.join(candidate, "bin", "java.exe");
    if (!fs.existsSync(javaBin)) continue;
    const text = fs.existsSync(release) ? fs.readFileSync(release, "utf8") : "";
    const match = text.match(/JAVA_VERSION="(\d+)/);
    const major = match ? Number(match[1]) : 0;
    if (major === 17 || major === 21) return candidate;
  }
  fail(
    "Precisa de JDK 17 ou 21. O Java 25 do Android Studio quebra o plugin do React Native. Encontrado Temurin 17 em C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.101-hotspot.",
  );
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function readSession() {
  const statePath = path.join(os.homedir(), ".expo", "state.json");
  if (!fs.existsSync(statePath)) fail("Sem sessão Expo em ~/.expo/state.json. Rode npx eas-cli login.");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const secret = state?.auth?.sessionSecret;
  if (!secret) fail("Sessão Expo sem sessionSecret. Rode npx eas-cli login.");
  return secret;
}

async function fetchKeystore() {
  const session = readSession();
  const query = `
    query CommonAndroidAppCredentials($projectFullName: String!, $applicationIdentifier: String) {
      app {
        byFullName(fullName: $projectFullName) {
          id
          androidAppCredentials(
            filter: { applicationIdentifier: $applicationIdentifier, legacyOnly: false }
          ) {
            id
            applicationIdentifier
            androidAppBuildCredentialsList {
              id
              isDefault
              name
              androidKeystore {
                id
                type
                keystore
                keystorePassword
                keyAlias
                keyPassword
                sha1CertificateFingerprint
              }
            }
          }
        }
      }
    }
  `;
  const res = await fetch("https://api.expo.dev/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "expo-session": session,
    },
    body: JSON.stringify({
      query,
      variables: {
        projectFullName: "@blvbruno/chartfm-app",
        applicationIdentifier: "br.com.chartfm",
      },
    }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    fail("GraphQL EAS falhou: " + json.errors.map((e) => e.message).join("; "));
  }
  const creds = json.data?.app?.byFullName?.androidAppCredentials ?? [];
  const list = creds.flatMap((c) => c.androidAppBuildCredentialsList ?? []);
  const chosen =
    list.find((c) => c.isDefault && c.androidKeystore?.keystore) ??
    list.find((c) => c.androidKeystore?.keystore);
  const ks = chosen?.androidKeystore;
  if (!ks?.keystore) fail("Nenhuma keystore de upload no EAS para br.com.chartfm.");

  fs.writeFileSync(keystorePath, Buffer.from(ks.keystore, "base64"));
  const body = [
    `storeFile=chartfm-upload.keystore`,
    `storePassword=${ks.keystorePassword}`,
    `keyAlias=${ks.keyAlias}`,
    `keyPassword=${ks.keyPassword}`,
    "",
  ].join("\n");
  fs.writeFileSync(propsPath, body, { encoding: "utf8" });
  console.log("Keystore de upload gravada.");
  console.log("Alias:", ks.keyAlias);
  if (ks.sha1CertificateFingerprint) console.log("SHA-1:", ks.sha1CertificateFingerprint);
}

function runGradle() {
  const javaHome = resolveJavaHome();
  const gradlePropsPath = path.join(androidDir, "gradle.properties");
  if (fs.existsSync(gradlePropsPath)) {
    let props = fs.readFileSync(gradlePropsPath, "utf8");
    const homeLine = `org.gradle.java.home=${javaHome.replace(/\\/g, "/")}`;
    if (/^org\.gradle\.java\.home=/m.test(props)) {
      props = props.replace(/^org\.gradle\.java\.home=.*$/m, homeLine);
    } else {
      props += `\n${homeLine}\n`;
    }
    fs.writeFileSync(gradlePropsPath, props);
  }
  const env = {
    ...process.env,
    JAVA_HOME: javaHome,
    ANDROID_HOME: androidHome,
    ANDROID_SDK_ROOT: androidHome,
  };
  const gradlew = path.join(androidDir, "gradlew.bat");
  console.log("JAVA_HOME=", javaHome);
  const javaCheck = spawnSync(path.join(javaHome, "bin", "java.exe"), ["-version"], {
    encoding: "utf8",
    env,
  });
  const javaOut = (javaCheck.stderr || javaCheck.stdout || "").trim();
  if (javaOut) console.log(javaOut.split("\n")[0]);

  console.log("Rodando bundleRelease...");
  const result = spawnSync(gradlew, ["bundleRelease", "--no-daemon"], {
    cwd: androidDir,
    env,
    encoding: "utf8",
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) fail("gradlew bundleRelease falhou.");
}

function copyAab() {
  const generated = path.join(appDir, "build", "outputs", "bundle", "release", "app-release.aab");
  if (!fs.existsSync(generated)) fail("AAB não encontrado em " + generated);
  fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(generated, outAab);
  const mb = (fs.statSync(outAab).size / (1024 * 1024)).toFixed(1);
  console.log("AAB pronto:", outAab, `(${mb} MB)`);
}

await fetchKeystore();
runGradle();
copyAab();
