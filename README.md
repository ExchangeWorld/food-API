# food-API

# Requirement

- postgre
- redis
- node v5

# Setup

1. setting up config file, `config/local.js`, you can copy the template.
```
$ cp local-development-template.js local.js
$ vim local.js
```

2. create postgre database first, then run the initial script
```bash
$ createdb food                 # create the postgre db
$ node scripts/init_pg_tool.js  # initial tables
```

3. run server
```
$ node cluster.js
```
