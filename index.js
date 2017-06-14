function randomInt(Min,Max, genotinarr, geinarr){
    Min = parseInt(Min);
    Max = parseInt(Max);
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range);
    if( typeof(genotinarr) != 'undefined' ) {
        // 确保产生的随机数的个位数不在数组中
        for(var i = 0;  genotinarr.indexOf(num % 10) >= 0 && i < 1000; i ++) {
            num = randomInt(Min, Max);
        }
    }
    if( typeof(geinarr) != 'undefined' ) {
        // 确保产生的随机数的个位数存在于数组中
        for(var i = 0;  geinarr.indexOf(num % 10) < 0 && i < 1000; i ++) {
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
        pagerows: 20,
        cols: 4,
        type: '',
        level: '20',
        rule: '1',
        whichcond: '',
        itemcount: 0,
        defrange: {min: 0, max:100},
        result: {min: 0, max:100},
        range: [],
        borrow: 'random',
        fontsize: 22,
        fontfamily: '宋体',
        cellPadding: 6,
        cellSpacing: 8,
        res: [],
        appendemptyrows: false,
        report: {
            total: 0,
            addcnt: 0, // 加法题数量
            subcnt: 0, // 减法题数量
            borrowcnt: 0, // 借/进位题数量
            exceptcnt: 0 // 异常题数量(由于冲突，未能按规则生成)
        }
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

        isValid: function(){
            if(this.result.max - 0 < this.result.min - 0 ) {
                alert('得数范围无效！');
                return false;
            }
            for(var i = 0; i < this.itemcount; i ++) {
                if( this.range[i].max - 0 < this.range[i].min - 0 ) {
                    alert('数值' +(i+1)+'范围无效！');
                    return false;
                }
            }

            // @todo 其它非法检测 ...

            return true;
        },

        genItem: function() {

            // 注意：
            // 1. 减法时第二个数必须比第一个数小，以避免产生负数结果
            // 2. 强制进位加法时，被加数个位必须不能为 0，否则无法产生进位，另外还要保证个位相加之和要大于 10
            // 3. 强制借位减法时，被减数个位必须不能为 9，并且不能小于 10，否则无法产生借位
            // 4. 强制借位减法时，首先必须保证被减数个位小于减数的个位，其次也必须保证减数总体小于被减数，以免产生负数

            var w = ''===this.whichcond ?  randomInt(0, this.itemcount -1) : this.whichcond - 0; // 已知得数，随机求某一个条件
            var min = this.range[0].min, max = this.range[0].max, limit, isexcept = false, isborrow = false;
            var op = this.op(), t, r, res;

            // 强制要带借/进位时，对被加/减数有要求
            if( 'all' == this.borrow ) {
                if( '+' == op ) {
                    limit = [0]; // 加法个位不能为 0.
                } else if( '-' == op ) {
                    min = Math.max(min, 10); // 强制借位减法，被减数不能小于 10.
                    limit = [9]; // 减法个位不能为 9.
                }
            }

            if( '+' == op ) {
                // 加法：数值 1 的最小值都超过了得数允许的最大值，则无法使用加法
                if( min > this.result.max ) {
                    // 未限制运算符？尝试变更运算符。
                    if( '' == this.type ) {
                        console.warn('被加数最小值超出了得数允许的最大范围，将智能变更为减法！')
                        op = '-';
                        r = randomInt(min, max, limit);
                    } else {
                        isexcept = true;
                        console.error('错误：被加数最小值超出了得数允许的最大范围！')
                    }
                } else {
                    // 被加数不能超过结果允许的最大值
                    max = Math.min(max, this.result.max);
                    r = randomInt(min, max, limit);
                }
            }
            else if( '-' == op ) {
                // 减法：必须保证被减数不可小于允许结果的最小值
                if( max < this.result.min ) {
                    if( '' == this.type ) {
                        console.warn('被减数最大值比得数允许的最小范围还要小，智能变更为加法！')
                        op = '+';
                        r = randomInt(min, max, limit);
                    } else {
                        isexcept = true;
                        console.error('错误：被减数最大值比得数允许的最小范围还要小！')
                    }
                } else {
                    min = Math.max(min, this.result.min);
                    r = randomInt(min, max, limit);
                }
            }

            // 如果前面无法生成合法的数值，这里就直接按数值 1 限定范围生成随机数即可！因为无论如何它将是一个异常的值！
            if( 'undefined' == typeof(r) ) {
                r = randomInt(this.range[0].min, this.range[0].max, limit);
            }

            // 已知得数，求条件，且第一个数就是被求的条件? 则将该数使用空白代替！
            var arr = [ ('2' == this.rule && 0 == w ) ? this.blank() : r ];
            for(var i = 1; i < this.itemcount; i ++, op = this.op()) {

                // 强制借/进位时，因为被加/减数的个位已经确定，所以加数的个位取值范围也确定了
                var ge = r % 10, res_ge = [];
                min = ('all' == this.borrow) ? ('+' == op ? 10 - ge : ge + 1) : 0; // 强制借/进位
                max = ('no' == this.borrow) ? ('+' == op ? 9 - ge : ge) : 9; // 强制不借/进位
                for(var j = min; j <= max; j++) {
                    res_ge.push( '+' == op ? (ge + j) % 10 : (ge + 10 - j) % 10);
                }

                // 先随机算出得数，再根据得数算出加数/减数 ...
                if( '+' == op ) {
                    // 加法结果：被加数 ~ result.max
                    min = Math.max(r, this.result.min);
                    max = this.result.max;
                    if( min > max ) {
                        console.error('错误：无法保证加法得数在设定范围内！');
                        max = min;
                        isexcept = true;
                    }
                    res = randomInt(min, max, undefined, res_ge);
                    t = res - r;
                }

                if( '-' == op ) {
                    // 减法结果：result.min ~ 被减数
                    min = Math.max(0, this.result.min);
                    max = Math.min(r, this.result.max);
                    if( min > max ) {
                        console.error('错误：无法保证减法得数在设定范围内！');
                        min = max;
                        isexcept = true;
                    }
                    res = randomInt(min, max, undefined, res_ge);
                    t = r - res;
                }

                if( t < this.range[i].min || t > this.range[i].max) {
                    console.error('错误：为保证得数在范围内，加数/减数将超出范围！', t, this.range[i].min, this.range[i].max);
                    isexcept = true;
                }

                if( 'all' == this.borrow) {
                    if( '+' == op && r % 10 + t % 10 < 10 ) {
                        console.error('错误：未能生成进位！', r, JSON.stringify(res_ge), t, res);
                        isexcept = true;
                    }
                    if( '-' == op && r % 10 >= t % 10 ) {
                        console.error('错误：未能生成借位！', r, JSON.stringify(res_ge), t, res);
                        isexcept = true;
                    }
                }

                if( '+' == op && r % 10 + t % 10 >= 10) isborrow = true; // 有进位
                if( '-' == op && r % 10 < t % 10) isborrow = true; // 有借位

                // 已知得数，求条件时，将条件换成空白
                arr.push(op); // 运算符号
                arr.push(( '2' == this.rule && i == w ) ? this.blank() : t);

                // 计算得数
                r = eval(r + op + t);
            }

            // 得数
            arr.push('=');
            arr.push(( '2' == this.rule ) ? r : this.blank())

            this.report.addcnt += '+' == op ? 1 : 0;
            this.report.subcnt += '-' == op ? 1 : 0;
            this.report.borrowcnt += isborrow ? 1 : 0;
            this.report.exceptcnt += isexcept ? 1 : 0;

            return arr;
        },

        doGen: function() {
            if( ! this.isValid() ) {
                return;
            }
            this.report.total = 0;
            this.report.addcnt = 0; // 加法题数量
            this.report.subcnt = 0; // 减法题数量
            this.report.borrowcnt = 0; // 借/进位题数量
            this.report.exceptcnt = 0; // 异常题数量(由于冲突，未能按规则生成)
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