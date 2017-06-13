function randomInt(Min,Max, nn){
    Min = parseInt(Min);
    Max = parseInt(Max);
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    if( typeof(nn) != 'undefined' ) {
        for(var i = 0;  num % 10 == nn && i < 1000; i ++) {
            num = randomInt(Min, Max);
        }
    }
    return num;
}

// @todo 表格内分页和表尾重复打印只有 IE 支持？ chrome 不支持！
var app = new Vue({
    el: '#app',
    data: {
        count: 100,
        pagerows: 10,
        cols: 4,
        type: '',
        level: '20',
        rule: '1',
        itemcount: 0,
        defrange: {min: 0, max:20},
        range: [],
        borrow: 'random',
        cellPadding: 10,
        cellSpacing: 10,
        res: [],
        message: 'Hello Vue!'
    },
    created: function() {
        this.itemcount = 2;
    },
    watch: {
        itemcount: function(val, oldval) {
            if( val < 2 )  {
                this.itemcount = 2;
                return;
            }
            if( val > 5 ) {
                this.itemcount = 5;
                return;
            }
            for (var i = 0; i < val; i ++) {
                if( ! this.range[i] ) {
                    this.range.splice(i, 1, {min: this.defrange.min, max: this.defrange.max});
                }
            }
            if( this.range.length > this.itemcount ) {
                this.range.splice(this.itemcount);
            }
        }
    },
    methods: {
        op: function() {
            return '+' == this.type ? '+' :
                ('-' === this.type ? '-' : (Math.round(Math.random()) ? '+' : '-'));
        },

        genItem: function() {

            // 注意：
            // 1. 减法时第二个数必须比第一个数小，以避免产生负数结果
            // 2. 强制进位加法时，被加数个位必须不能为 0，否则无法产生进位，另外还要保证个位相加之和要大于 10
            // 3. 强制借位减法时，被减数个位必须不能为 9，并且不能小于 10，否则无法产生借位
            // 4. 强制借位减法时，首先必须保证被减数个位小于减数的个位，其次也必须保证减数总体小于被减数，以免产生负数

            // @todo 实现不带借/进位 ...
            // @todo 优化强制带借/进位 ...

            var v = this.op(), t, r = randomInt(this.range[0].min, this.range[0].max);
            var w = randomInt(0, this.itemcount -1); // 已知得数，随机求某一个条件

            // 强制借/进位时，：加法被加数个位不能为 0, 减法被减数个位不能为 9，且不能小于 10
            if( 'all' == this.borrow ) {
                if( '+' == v && r % 10 == 0 ) {
                    r = randomInt(this.range[0].min, this.range[0].max, 0);
                } else if( '-' == v && (r < 10 || r % 10 == 9) ) {
                    r = randomInt(this.range[0].min < 10 ? 10 : this.range[0].min, this.range[0].max, 9);
                }
            }

            var arr = [];
            arr.push(r);

            // 第一个数就是被求的条件?
            if( '2' == this.rule && 0 == w ) {
                arr[0] = this.blank();
            }

            for(var i = 1; i < this.itemcount; i ++, v = this.op()) {
                arr.push(v);

                t = randomInt(this.range[i].min, this.range[i].max);
                if( v == '-' ) {
                    // 减法要避免结果为负，必须保证 min[i] <= t <= r
                    var min = this.range[i].min > r ? 0 : this.range[i].min;
                    t = randomInt(min, r);
                }

                // 强制借/进位：加法个位相加和要大于 10，减数个位要大于被减 数个位，且比被减 数要小
                // 注意连减时前面也有可能出现被减数为 9 的情况，或者被减数小于 10 的情况
                if( 'all' == this.borrow) {
                    var ge = r % 10;
                    if( '+' == v ) {
                        // @todo: 连加时，上一位可能个位为 0，这会造成后面的无法强制进位，必须修正
                        if( 0 == ge ) {
                            ge ++; // 0 变 1 (可优化成随机?) 但这有可能导致前面的结果无法产生借/进位！8-9 变成了 8-8, 1+9 变成了 1+8
                            r ++;
                            if( '+' == arr[arr.length-3] ) {
                                arr[arr.length-2] ++;
                            } else {
                                arr[arr.length-2] --;
                            }
                        }
                        var newge = randomInt(10 - ge, 9);
                        t = t - (t % 10) + newge // 改变个位，以强制进位
                    } else if( '-' == v && r >= 10) {
                        // @todo: 如果强制借位，且下一项运算符是减法，且当前不是最后一个算数，则必须保证结果个位不能为 9
                        if( 9 == ge ) {
                            ge --; // 9 变 8 (可优化成随机?) 但这有可能导致前面的结果无法产生借/进位！8-9 变成了 8-8, 1+9 变成了 1+8
                            r --;
                            if( '+' == arr[arr.length-3] ) {
                                arr[arr.length-2] --;
                            } else {
                                arr[arr.length-2] ++;
                            }
                        }
                        // 强制借位时，被减数必须大于 10
                        var newge = randomInt(ge + 1, 9);
                        t = t - (t % 10) + newge; // 改变个位，以强制进位
                        if( t > r) {
                            // 减数大于被减数了？重新生成一个有效的！
                            t = r - (r % 10) - (10 * randomInt(1, parseInt(r / 10)))  + newge;
                        }
                    }
                }

                // 已知得数，求条件
                if( '2' == this.rule && i == w ) {
                    arr.push(this.blank());
                } else {
                    arr.push(t);
                }
                r = eval(r + v + t);
            }

            arr.push('=');

            if( '2' == this.rule ) {
                arr.push(r);
            }else {
                arr.push(this.blank());
            }

            return arr;
        },

        doGen: function() {
            this.res = [];
            for(var i = 0; i < this.count; i ++) {
                var item = {
                    li: this.genItem()
                };
                this.res.push(item);
            }
        },

        doPrint: function() {
            if( window.document.all && window.ActiveXObject && !window.opera ) {
                window.document.all.WebBrowser.ExecWB(7,1);
            } else {
                window.print();
            }
        },

        blank: function() {
            return '___';
        }

    }
})