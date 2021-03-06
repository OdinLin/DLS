(function () {
    'use strict';
    angular.module('task', ['ngMaterial', 'googlechart', 'taskView', 'taskModel', 'taskDataset', 'taskTest'])
        .component('task', {
            templateUrl: '/frontend/components/main/task/task.html',
            controller: function ($mdDialog, $rootScope, $scope, $http) {

                var self = this;
                //
                self.paramMaxPts = 20;
                self.getInitPlotData = function (numpts) {
                    var tmp = {
                        "type": "AreaChart",
                        "displayed": false,
                        "data": {
                            "cols": [
                                {
                                    "id": "epoch",
                                    "label": "#epoches",
                                    "type": "number",
                                    "p": {}
                    },
                                {
                                    "id": "test-loss",
                                    "label": "Accuracy on TrainingSet",
                                    "type": "number",
                                    "p": {}
                    },
                                {
                                    "id": "test-error",
                                    "label": "Accuracy on TestSet",
                                    "type": "number",
                                    "p": {}
                    }
                ],
                            "rows": []
                        },
                        "options": {
                            "title": "Training convergence",
                            "isStacked": "true",
                            "fill": 20,
                            "displayExactValues": true,
                            "vAxis": {
                                "title": "Accuracy",
                                "gridlines": {
                                    "count": 5
                                }
                            },
                            "hAxis": {
                                "title": "Epoch"
                            }
                        },
                        "formatters": {}
                    };
                    /*for (var ii = 0; ii < numpts; ii++) {
                        self.addRandomPoint2Plot(tmp);
                    }*/
                    return tmp;
                };
                self.addRandomPoint = function () {
                    if (!self.isShowInfo || (self.selectedIndex < 0)) {
                        return;
                    }
                    var tmp = self.curr();
                    var parChartData = tmp.plot;
                    self.addRandomPoint2Plot(parChartData);
                    tmp.progress = tmp.progress + (100 / self.paramMaxPts);
                    if (tmp.progress > 99) {
                        tmp.isFinished = true;
                    }
                };
                self.addRandomPoint2Plot = function (parChartData) {
                    var len = parChartData['data']['rows'].length;
                    parChartData['data']['rows'].push({
                        "c": [
                            {
                                "v": len + 1
                            },
                            {
                                "v": Math.random() * 100
                            },
                            {
                                "v": Math.random() * 100
                            }
            ]
                    });
                };
                self.showLogDialog = function (id) {
                    var tmp = self.curr();
                    $http({
                        method: "GET",
                        url: "/task/log/" + id,
                    }).then(function mySucces(response) {
                        console.log(response.data);
                        $mdDialog.show(
                            $mdDialog.confirm().title('Training Log').textContent(response.data).ariaLabel('Log').ok('Ok').theme('log_dialog')
                        );
                    }, function myError(response) {
                        console.log(response);
                    });
                };
                //
                self.isChecked = false;
                self.isShowInfo = true;
                self.selectedIndex = -1;
                self.listDats = [];
                self.chartData = function () {
                    if (self.selectedIndex >= 0) {
                        return self.takskMap[self.selectedIndex].plot;
                    }
                };
                self.curr = function () {
                    if (self.selectedIndex > -1) {
                        return self.takskMap[self.selectedIndex];
                    }
                };
                self.doPrimaryAction = function ($event, $index) {
                    console.log($event + " : " + $index);
                    self.selectedIndex = $index;
                    self.isChecked = true;
                };
                self.doItemInfo = function ($event) {
                    console.log('Info: ' + $event);
                };
                self.doItemDelete = function (id) {
                    console.log('Delete: ' + id);
                    $http({
                        method: "POST",
                        url: "/task/term",
                        data: {
                            index: id
                        }
                    }).then(function mySucces(response) {
                        console.log(response.data);
                    }, function myError(response) {
                        console.log(response);
                    });
                }
                self.stateIncludes = [];
                self.includeState = function (state) {
                    var i = $.inArray(state, self.stateIncludes);
                    if (i > -1) {
                        self.stateIncludes.splice(i, 1);
                    } else {
                        self.stateIncludes.push(state);
                    }
                }

                self.stateFilter = function (task) {
                    if (self.stateIncludes.length > 0) {
                        if ($.inArray(task.state, self.stateIncludes) < 0)
                            return;
                    }

                    return task;
                }

                var socket = io.connect('http://' + document.domain + ':' + location.port);
                socket.on('task_monitor', function (msg) {
//                    console.log(msg);
                    var tasks = JSON.parse(msg);
                    //task.plot = self.getInitPlotData();
                    for (var i = 0; i < tasks.length; i++) {
                        tasks[i].plot = self.getInitPlotData();
                        tasks[i].plot.data.rows = tasks[i].rows;
                    }

                    self.takskMap = {};
                    for(var i in tasks){
                        var t = tasks[i]
                        self.takskMap[t.id] = t;
                    }
                    self.listDats = tasks;
                    $scope.$apply()
                });

            }
        });
})();