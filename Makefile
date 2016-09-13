all: build init start

build:
	docker-compose -f ledgers.yml build

init: reinit_db initialize accounts assets

initialize:
	docker-compose -f ledgers.yml run --rm bdb-0 bigchaindb -c .bigchaindb_examples init
	docker-compose -f ledgers.yml run --rm bdb-1 bigchaindb -c .bigchaindb_examples init

accounts:
	docker-compose -f ledgers.yml run --rm bdb-0 python init_accounts.py

assets:
	docker-compose -f ledgers.yml run --rm bdb-0 python init_assets.py


drop_db:
	docker-compose -f ledgers.yml stop rdb
	docker-compose -f ledgers.yml rm -f rdb

start_db:
	docker-compose -f ledgers.yml up -d rdb

reinit_db: drop_db start_db

start:
	docker-compose -f ledgers.yml up
