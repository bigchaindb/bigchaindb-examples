#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sphinx_rtd_theme


extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.doctest',
    'sphinx.ext.intersphinx',
    'sphinx.ext.todo',
    'sphinx.ext.coverage',
    'sphinx.ext.viewcode',
    'sphinx.ext.napoleon',
]

templates_path = ['_templates']
source_suffix = '.rst'
master_doc = 'index'
project = 'BigchainDB Examples'
copyright = '2016, BigchainDB Contributors'
author = 'BigchainDB Contributors'
version = '0.0.2'
release = '0.0.2'
language = None
exclude_patterns = []
pygments_style = 'sphinx'
todo_include_todos = True
html_theme = 'sphinx_rtd_theme'
html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]
html_static_path = ['_static']
htmlhelp_basename = 'BigchainDBExamplesdoc'

latex_elements = {}
latex_documents = [
    (master_doc, 'BigchainDBExamples.tex', 'BigchainDB Examples Documentation',
     'BigchainDB Contributors', 'manual'),
]

man_pages = [
    (master_doc, 'bigchaindbexamples', 'BigchainDB Examples Documentation',
     [author], 1)
]

texinfo_documents = [
    (master_doc, 'BigchainDBExamples', 'BigchainDB Examples Documentation',
     author, 'BigchainDBExamples', 'One line description of project.',
     'Miscellaneous'),
]

intersphinx_mapping = {'https://docs.python.org/': None}
