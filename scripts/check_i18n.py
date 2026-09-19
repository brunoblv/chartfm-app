import re, glob

en = open('src/i18n/en.ts', encoding='utf8').read()
keys = set(re.findall(r'^\s*"([^"]+)":', en, re.M))
miss = {}
for f in glob.glob('src/**/*.ts*', recursive=True):
    if 'i18n' in f:
        continue
    for m in re.finditer(r'\btr\("([^"]*)"\)', open(f, encoding='utf8').read()):
        if m.group(1) not in keys:
            miss.setdefault(m.group(1), f)
for k in miss:
    print(k)
print(len(miss), 'missing')
