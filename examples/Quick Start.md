
1. Go to https://test.sentio.xyz/
Login with google or github

2. Clone this repo
```
git clone https://github.com/sentioxyz/sentio-sdk
```
3. Build
``` 
./scripts/build-all.sh 
```
4. Choose an example to run
```
cd examples/mirrorworld
```

5. open (profile)[https://test.sentio.xyz/profile] page, generate a api key
copy paste the prompt command line  `yarn sentio login ...`

6.  try upload the project
```
yarn sentio upload --host=test
```

7. if it tells xxx project is not found,  create the project in web page.
rerun the command
```
yarn sentio upload --host=test
```

