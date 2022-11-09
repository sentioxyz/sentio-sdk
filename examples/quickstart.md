
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
cd examples/x2y2
```

5. Login to sentio
```
yarn sentio login --host=test
```
then finish the login in browser and go back to command line to create an API key


6.  try upload the project
```
yarn sentio upload --host=test
```

you should see the uploading runs and down 

```
Upload success:
	 sha256: xxxx
	 Git commit SHA: xxx
	 Check status: https://test.sentio.xyz/regulus/x2y2/datasource
✨  Done in 7.66s.

```

7. if it tells xxx project is not found,  create the project in web page.
rerun the command
```
yarn sentio upload --host=test
```

