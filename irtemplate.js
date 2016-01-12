/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
    "use strict";

    var SPLIT_REGEX = /[.,:;]/;

    function IRTemplateNode(n) {
        this.ircommands = n.ircommands || [];
        this.ircommandsWithAliases = [];
        this.outputs = this.ircommands.length;
        RED.nodes.createNode(this, n);
        var node = this;

        for (var key in this.ircommands) {
            var aliases = this.ircommands[key].name.split(SPLIT_REGEX);
            if (aliases.length <= 1) {
                this.ircommandsWithAliases.push({
                    name: this.ircommands[key].name,
                    value: this.ircommands[key].value,
                    output: key
                });
                continue;
            }
            for (var aliasKey in aliases)
                this.ircommandsWithAliases.push({
                    name: aliases[aliasKey].trim(),
                    value: this.ircommands[key].value,
                    output: key
                });
        }

        this.on('input', function (msg) {
            var toSend;
            var output;
            var ircommand;
            if (typeof(msg) === "object" && msg.cmd && msg.cmd === ('test_ir#' + node.id.toString())) {
                output = parseInt(msg.output);
                ircommand = msg.ircommand;
            }
            else {
                if (!(msg && msg.hasOwnProperty('payload'))) return;
                var payload = msg.payload;
                if (typeof(msg.payload) === "object") {
                    payload = msg.payload;
                } else if (typeof(msg.payload) === "string") {
                    try {
                        payload = JSON.parse(msg.payload);
                        if (typeof (payload) === 'number')
                            payload = {cmd: msg.payload.toString()};
                    } catch (e) {
                        payload = {cmd: msg.payload.toString()};
                    }
                }
                if (payload == null)
                    return node.error('IRTemplate: msg.payload required!');

                for (var key in node.ircommandsWithAliases)
                    if (node.ircommandsWithAliases[key].name === payload.cmd) {
                        output = parseInt(node.ircommandsWithAliases[key].output) + 1;
                        ircommand = node.ircommandsWithAliases[key].value;
                        break;
                    }
                if (!output || !ircommand)
                    return node.error('IRTemplate: Unknown command[' + JSON.stringify(payload) + ']');
            }
            toSend = new Array(output);
            toSend[output - 1] = {payload: ircommand.toString()};
            return node.send(toSend);
        });
    }

    RED.nodes.registerType("irtemplate", IRTemplateNode);

    RED.httpAdmin.post("/irtemplate/:id/:ircommand/:output", RED.auth.needsPermission("irtemplate.write"), function (req, res) {
        var node = RED.nodes.getNode(req.params.id);
        var ircommand = req.params.ircommand ? req.params.ircommand.toString() : null;
        var output = parseInt(req.params.output);
        var msg;
        if (ircommand !== '' && typeof(ircommand) !== 'undefined')
            msg = {
                cmd: 'test_ir#' + node.id.toString(),
                ircommand: ircommand,
                output: output
            }
        if (node != null && msg != null) {
            try {
                node.receive(msg);
                res.send(200);
            } catch (err) {
                res.send(500);
                node.error(RED._("irtemplate.failed", {error: err.toString()}));
            }
        } else {
            res.send(404);
        }
    });
}
