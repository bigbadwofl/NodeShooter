git add *.*
git reset node_modules
git rm node_modules -r
git commit -m "initial eq code"
heroku ps:scale web=1