# gh-pages setup

worktree!

## initial

```sh
git checkout --orphan gh-pages
git rm --cached -r .
git add readme.md
git commit -m "Initial"
git symbolic-ref HEAD refs/heads/master
git reset --mixed
git push -u origin gh-pages
git worktree add gh-pages gh-pages
```

## ongoing

```sh
copy example/* gh-pages # dirty windows user!!!
copy dist/* gh-pages # dirty windows user!!!
cd gh-pages
git add . --all
git commit -am "Release vx.x.x"
git push
```
