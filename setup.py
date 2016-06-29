"""
BigchainDB: A Scalable Blockchain Database

For full docs visit https://bigchaindb.readthedocs.org

"""
from setuptools import setup, find_packages

tests_require = [
    'pytest',
    'coverage',
    'pep8',
    'pyflakes',
    'pylint',
    'pytest',
    'pytest-cov',
    'pytest-xdist',
    'pytest-flask',
]

dev_require = [
    'ipdb',
    'ipython',
]

docs_require = [
    'recommonmark>=0.4.0',
    'Sphinx>=1.3.5',
    'sphinxcontrib-napoleon>=0.4.4',
    'sphinx-rtd-theme>=0.1.9',
]

setup(
    name='BigchainDB-Examples',
    version='0.1.0',
    description='Example usages for BigchainDB',
    long_description=__doc__,
    url='https://github.com/BigchainDB/bigchaindb-examples/',
    author='BigchainDB Contributors',
    author_email='dev@bigchaindb.com',
    license='AGPLv3',
    zip_safe=False,

    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Topic :: Database',
        'Topic :: Database :: Database Engines/Servers',
        'Topic :: Software Development',
        'Natural Language :: English',
        'License :: OSI Approved :: GNU Affero General Public License v3',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Operating System :: MacOS :: MacOS X',
        'Operating System :: POSIX :: Linux',
    ],

    packages=find_packages(exclude=['tests*']),

    entry_points={
        'console_scripts': [
            'bigchaindb-examples=commands.bigchaindb_examples:main'
        ]
    },

    install_requires=[
        "rethinkdb==2.3.0",
        "BigchainDB>=0.4.4",
        "decorator==4.0.9",
        "flask==0.10.1",
        "flask-cors==2.1.2",
        "tornado"
    ],

    setup_requires=['pytest-runner'],
    tests_require=tests_require,
    dependency_links=[
        'git+https://github.com/bigchaindb/bigchaindb.git@cc20136cb14b98b323faaead0c2456f8c9859a0b#egg=bigchaindb-0.4.4',
    ],
    extras_require={
        'test': tests_require,
        'dev':  dev_require + tests_require + docs_require,
        'docs':  docs_require,
    },
)
