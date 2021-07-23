# https://stackoverflow.com/questions/1583219/how-to-do-a-recursive-find-replace-of-a-string-with-awk-or-sed
# https://stackoverflow.com/questions/4210042/how-to-exclude-a-directory-in-find-command
find . -type f -not -path "./.git" -exec sed -i 's/yourDomainName\.topLevelDomainName/yourDomainName\.topLevelDomainName/g' {} +
