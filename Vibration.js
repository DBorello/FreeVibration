var app = angular.module('app', ['ui.bootstrap-slider']); // this creates a module

function VibrationCtrl($scope, $interval) {
    d = new Date();
    $scope.StartTime = d.getTime();
    $scope.run = true;

    $scope.m = 2;
    $scope.c = 0.0;
    $scope.k = 2;

    $scope.u0 = 1;
    $scope.v0 = 0;

    $scope.wn = function () {
        return Math.sqrt($scope.k / $scope.m);
    };

    $scope.fn = function () {
        return Math.sqrt($scope.k / $scope.m) / 2 / Math.PI;
    };

    $scope.Tn = function () {
        return 1 / (Math.sqrt($scope.k / $scope.m) / 2 / Math.PI);
    };

    $scope.ccr = function () {
        return 2 * Math.sqrt($scope.k * $scope.m);
    };

    $scope.zeta = function () {
        return $scope.c / $scope.ccr();
    };

    $scope.wd = function () {
        return $scope.wn() * Math.sqrt(1 - Math.pow($scope.zeta(), 2));
    };

    $scope.ws = function () {
        return $scope.wn() * Math.sqrt( Math.pow($scope.zeta(), 2) - 1);
    };

    $scope.U = function() {
        if ($scope.zeta() < 1) {
            return Math.sqrt(Math.pow($scope.u0, 2) + Math.pow(($scope.v0 + $scope.zeta() * $scope.wn() * $scope.u0) / $scope.wd(), 2));
        } else {
            return Math.sqrt(Math.pow($scope.u0, 2) + Math.pow(($scope.v0 + $scope.zeta() * $scope.wn() * $scope.u0) / $scope.ws(), 2));
        }
    }

    $scope.u = function (t) {
        wn = $scope.wn();
        wd = $scope.wd();

        u0 = $scope.u0;
        v0 = $scope.v0;
        zeta = $scope.zeta();
        ws = $scope.ws();

        if ($scope.zeta() < 1) {
            u = Math.pow(Math.E, -zeta * wn * t) * (u0 * Math.cos(wd * t) + (v0 + zeta * wn * u0) / wd * Math.sin(wd * t));
        } else {
            u = Math.pow(Math.E, -zeta * wn * t) * (u0 * Math.cosh(ws * t) + (v0 + zeta * wn * u0) / ws * Math.sinh(ws * t));
        }
        return u;
    };

    $scope.v = function (t) {
        wn = $scope.wn();
        wd = $scope.wd();
        u0 = $scope.u0;
        v0 = $scope.v0;
        zeta = $scope.zeta();
        ws = $scope.ws();



        if ($scope.zeta() < 1) {
            A1 = u0;
            A2 = (v0+zeta*wn*u0)/wd;
            v =  -zeta * wn * Math.pow(Math.E, -zeta * wn * t) * (A1 * Math.cos(wd * t) + A2 * Math.sin(wd * t)) + Math.pow(Math.E, -zeta * wn * t) * (-A1 * wd * Math.sin(wd * t) + A2 * wd * Math.cos(wd * t));
        } else {
            A1 = u0;
            A2 = (v0+zeta*wn*u0)/ws;
            v = Math.pow(Math.E, -zeta * wn * t) * ( -zeta*wn*(A1 * Math.cosh(ws*t) + A2 * Math.sinh(ws*t)) + ws*(A1*Math.sinh(ws*t) + A2*Math.cosh(ws*t) ));
        }
        return v;
    };

    $scope.a = function (t) {
        wn = $scope.wn();
        wd = $scope.wd();
        u0 = $scope.u0;
        v0 = $scope.v0;
        zeta = $scope.zeta();
        ws = $scope.ws();

        A1 = u0;
        A2 = (v0+zeta*wn*u0)/wd;

        if ($scope.zeta() < 1) {
            A1 = u0;
            A2 = (v0+zeta*wn*u0)/wd;
            a = Math.pow(Math.E, -zeta * wn * t) * (Math.pow(zeta, 2) * Math.pow(wd, 2) * (A1 * Math.cos(wd * t) + A2 * Math.sin(wd * t)) - 2 * zeta * wn * (-A1 * wd * Math.sin(wd * t) + A2 * wd * Math.cos(wd * t)) - A1 * Math.pow(wd, 2) * Math.cos(wd * t) - A2 * Math.pow(wd, 2) * Math.sin(wd * t));
        } else {
            A1 = u0;
            A2 = (v0+zeta*wn*u0)/ws;
            v = Math.pow(Math.E, -zeta * wn * t) * ( -zeta*wn*(A1 * Math.cosh(ws*t) + A2 * Math.sinh(ws*t)) + ws*(A1*Math.sinh(ws*t) + A2*Math.cosh(ws*t) ));
            a = -zeta*wn*v +  Math.pow(Math.E, -zeta * wn * t) * ( -zeta*wn*ws*(A1 * Math.sinh(ws*t) + A2* Math.cosh(ws*t)) + Math.pow(ws,2)* (A1*Math.cosh(ws*t) + A2*Math.sinh(ws*t) )  );
        }
        return a;
    };


    $scope.doUpdate = function() {
        if ($scope.m < 0.01) {
            $scope.m = 0.01;
        }

        d = new Date();
        t = (d.getTime() - $scope.StartTime)/1000;

        if ($scope.chartD.series[0].data.length > 1) {
            shift = (t - $scope.chartD.series[0].data[0]['x']) > 10;
        } else {
            shift = false
        }

        u = $scope.u(t);
        v = $scope.v(t);
        a = $scope.a(t);
        U = $scope.U();

        $scope.chartD.series[0].addPoint([t, u], false, shift);
        $scope.chartD.series[1].addPoint([t, v], false, shift);
        $scope.chartD.series[2].addPoint([t, a], false, shift);
        $scope.chartD.xAxis[0].update({min: t-10});
        $scope.chartD.xAxis[0].update({max: t});
        $scope.chartD.redraw();

        $scope.UpdateFBD(u,U);
    };

    $scope.Restart = function(){
        var d = new Date();
        $scope.StartTime = d.getTime();

        $scope.chartD.series[0].setData([]);
        $scope.chartD.series[1].setData([]);
        $scope.chartD.series[2].setData([]);

        $scope.ResetYAxis();
    };

    $scope.ResetYAxis = function(){
        $scope.chartD.yAxis[0].update({min: -$scope.U()*1.1});
        $scope.chartD.yAxis[0].update({max: $scope.U()*1.1});
    };

    $scope.chartD =new Highcharts.Chart({
        chart: {
            renderTo: 'containerD',
            defaultSeriesType: 'line',
            animation: false
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'linear',
            tickPixelInterval: 150,
            minRange: 10,
        },
        yAxis: {
            minPadding: 0.2,
            maxPadding: 0.2,
            min: -$scope.U()*1.1,
            max: $scope.U()*1.1,
            title: {
                text: '',
                margin: 80
            }
        },
        series: [{
            name: 'Displacement',
            animation: false,
            marker: {
                enabled: false
            },
            color: '#0000FF',
            data: []
        },
            {
                name: 'Velocity',
                animation: false,
                marker: {
                    enabled: false
                },
                color: '#FF0000',
                data: []
            },
            {
                name: 'Acceleration',
                animation: false,
                marker: {
                    enabled: false
                },
                color: '#00FF00',
                data: []
            }
        ],
        tooltip: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });

    $scope.Run = function() {
        d = new Date();
        if ($scope.run) { //Pause
            a = $interval.cancel($scope.int);
            $scope.run = false;
            $scope.T = (d.getTime() - $scope.StartTime);
        } else { // Resumse
            $scope.StartTime = d.getTime() - $scope.T;
            $scope.int = $interval($scope.doUpdate, 50);
            $scope.run = true;

        }
    };


    $scope.DrawFBD = function() {
        var canvas = document.getElementById('myCanvas');
        paper.setup(canvas);

        var from = new paper.Point(400, 0);
        var to = new paper.Point(400, 200);
        var path = new paper.Path.Line(from, to);
        path.strokeColor = 'black';

        //Frame
        var Frame = new paper.Path();
        Frame.strokeColor = 'black';
        Frame.add(new paper.Point(50, 00));
        Frame.add(new paper.Point(50, 175));
        Frame.add(new paper.Point(750, 175));

        //Damper
        var Damper = new paper.Path();
        Damper.strokeColor = '#FF0000';

        Damper.add(new paper.Point(50, 125));
        Damper.add(new paper.Point(75, 125));
        Damper.add(new paper.Point(75, 115));
        Damper.add(new paper.Point(300, 115));
        Damper.add(new paper.Point(75, 115));
        Damper.add(new paper.Point(75, 135));
        Damper.add(new paper.Point(300, 135));

        //Cart
        var rectangle = new paper.Rectangle(new paper.Point(350, 50), new paper.Point(450, 150));
        var Cart = new paper.Path.Rectangle(rectangle);
        Cart.fillColor = '#0000FF';

        //Wheels
        var Wheel1 = new paper.Path.Circle(new paper.Point(375, 162.5), 12.5);
        Wheel1.fillColor = 'black';
        var Wheel2 = new paper.Path.Circle(new paper.Point(425, 162.5), 12.5);
        Wheel2.fillColor = 'black';

        //Cart Damper
        var DamperRod = new paper.Path();
        DamperRod.strokeColor = '#FF0000';
        DamperRod.add(new paper.Point(350, 125));
        DamperRod.add(new paper.Point(200, 125));
        DamperRod.add(new paper.Point(200, 135));
        DamperRod.add(new paper.Point(200, 115));

        //Group
        CartGroup = new paper.Group([Cart, Wheel1, Wheel2, DamperRod]);
        //CartGroup.strokeColor = 'black'

        //Spring
        var ds = 200 / 8;
        Spring = new paper.Path();
        Spring.strokeColor = '#00FF00';
        Spring.add(new paper.Point(50, 75));
        Spring.add(new paper.Point(100, 75));

        Spring.add(new paper.Point(100 + 0.5 * ds, 85));
        Spring.add(new paper.Point(100 + 1.5 * ds, 65));
        Spring.add(new paper.Point(100 + 2.5 * ds, 85));
        Spring.add(new paper.Point(100 + 3.5 * ds, 65));
        Spring.add(new paper.Point(100 + 4.5 * ds, 85));
        Spring.add(new paper.Point(100 + 5.5 * ds, 65));
        Spring.add(new paper.Point(100 + 6.5 * ds, 85));
        Spring.add(new paper.Point(100 + 7.5 * ds, 65));
        Spring.add(new paper.Point(300, 75));
        Spring.add(new paper.Point(350, 75));

        Spring.scale(1, 1, new paper.Point(50, 75))
    };

    $scope.UpdateFBD = function(u,U) {

        CartGroup.position = new paper.Point(Math.round(400 + 100*u/U - 75), 112.5);
        //Spring.scale(0.7,1, new paper.Point(50,75))

        //Spring
        SpringLength = Spring.segments[Spring.segments.length-1].point.x - Spring.segments[0].point.x;
        NewLength = 300 + 100*u/U;
        Spring.scale(NewLength/SpringLength,(2-NewLength/SpringLength),new paper.Point(50,75));

        paper.view.draw();
    };


    $scope.SliderOptions = {
        min: 0.01,
        max: 10,
        step: 0.1,
    }

    $scope.chartD.series[1].hide();
    $scope.chartD.series[2].hide();

    $scope.DrawFBD();
    $scope.int = $interval($scope.doUpdate, 10);
}

app.controller('VibrationCtrl',VibrationCtrl);