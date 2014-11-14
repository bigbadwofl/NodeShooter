git add *.*
git reset node_modules
git rm node_modules -r
git commit -m "rewrote mob item code"
heroku ps:scale web=1