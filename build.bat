git config --global user.email "skichenbrand@gmail.com"
git add *.*
git reset node_modules
git commit -m msg
git push heroku master
heroku ps:scale web=1
heroku open