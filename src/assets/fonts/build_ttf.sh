#!/bin/bash
mkdir -p ttf
files=(./source-han-serif/OTF/SimplifiedChinese/*.otf)
for in in ${files[@]}; do
    out=ttf/$(basename $in .otf).ttf
    python3 otf2ttf.py $in $out --post-format 3 &
    pids[${i}]=$!
done

for pid in ${pids[*]}; do
    wait $pid
done

echo done.
