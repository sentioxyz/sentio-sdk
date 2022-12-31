gh release list | grep Pre-release | awk '{print $1;}' | xargs -L1 gh release delete
