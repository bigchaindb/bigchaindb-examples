all: reinit_db configure init accounts assets start


configure:
	docker-compose -f ledgers.yml run --rm bdb-0 bigchaindb -y configure 
	docker-compose -f ledgers.yml run --rm bdb-1 bigchaindb -y configure

init:
	docker-compose -f ledgers.yml run --rm bdb-0 bigchaindb init
	docker-compose -f ledgers.yml run --rm bdb-1 bigchaindb init

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
