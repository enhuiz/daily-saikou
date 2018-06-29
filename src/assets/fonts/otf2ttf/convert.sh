for file in ./*.otf
do
  echo "converting $file"
  python3 otf2ttf.py "$file"
done
