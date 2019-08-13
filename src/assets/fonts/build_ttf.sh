#!/bin/bash

if [ ! -e SourceHanSansSC.zip ]; then
    wget https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/SourceHanSansSC.zip
    unzip SourceHanSansSC.zip
else
    echo 'SourceHanSansSC.zip exists.'
fi

mkdir -p ttf
files=(./SourceHanSansSC/*.otf)
for in in ${files[@]}; do
    out=ttf/$(basename $in .otf).ttf
    python3 otf2ttf.py $in $out --post-format 3 &
    pids[${i}]=$!
done

for pid in ${pids[*]}; do
    wait $pid
done

echo done.
