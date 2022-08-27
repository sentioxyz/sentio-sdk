BRANCH=dev/$(git config --get user.email | cut -d @ -f1)/$1

git checkout $BRANCH || (git checkout -b $BRANCH && git fetch && git reset --hard origin/main)
