############ CAUTION ########################
#
#   PLEASE DO NOT WRITE "COMPLEX" CODE in this Makefile
#
# Makefile (GNU Make) is nice tools as a command dispatcher than
# other almost tools.
#
# However, Makefile is easy to be complex spaghetti code.
# GNU Make provide many useful and horrible features
# which we can use it as foot-gun easiliy.
# They can fire your job if you write a "bit complex" code for Makefile.
#
#   PLEASE DO NOT WRITE "COMPLEX" CODE in this Makefile.
#
# If you maintain this file,
# please write your code explicitly even if that is verbose.
#
# You would feel to want to use "powerful (awful)" GNU Make's features.
# But do not. It's trap.
# You should doubt. You don't have to use such powerful feature to achive your purpose.
# Instead, write explicitly verbose. Please write explicitly.
#
# Nevertheless, you need to consider 3 time that this awful feature only can do your porpose.
# Please think it. GNU Make is like jQuery.
# These tools are powerful and super convinient. But it make your code horrible easily.
#
#   PLEASE DO NOT WRITE "COMPLEX" CODE in this Makefile.
#
############ CAUTION ########################

all: help

.PHONY: help
help:
	@echo "Specify the task"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@exit 1
