git add *.*
git reset node_modules
git rm node_modules -r
git commit -m "room saving"
git push heroku master
heroku ps:scale web=1