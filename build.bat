git add *.*
git reset node_modules
git rm node_modules -r
git commit -m "hostile mobs"
heroku ps:scale web=1