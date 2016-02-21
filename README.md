node-red-contrib-irtemplate
==========================
# Description

BeeToo's IRTemplate for node-red.
It allows to store a set of IR commands to be sent in some IR blaster (Glogal Cache`, for exapmle).

# What's inside?
 
# Usage

According to official documentation: http://nodered.org/docs/getting-started/adding-nodes.html
 
# License

![Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png "CC BY-NC-SA 4.0")

# TODOs

1. Refactor output endpoints. It should be just one. Msg object going out of this output will be: {topic: cmd_alias, payload: value}