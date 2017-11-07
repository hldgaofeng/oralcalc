function randomInt(Min,Max, genotinarr, geinarr){
    Min = parseInt(Min);
    Max = parseInt(Max);
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range);
    if( typeof(genotinarr) != 'undefined' && genotinarr.length > 0 ) {
        // 确保产生的随机数的个位数不在数组中
        for(var i = 0;  genotinarr.indexOf(num % 10) >= 0 && i < 1000; i ++) {
            num = randomInt(Min, Max);
        }
    }
    if( typeof(geinarr) != 'undefined' && geinarr.length > 0 ) {
        // 确保产生的随机数的个位数存在于数组中
        for(var i = 0;  geinarr.indexOf(num % 10) < 0 && i < 1000; i ++) {
            num = randomInt(Min, Max);
        }
    }
    return num;
}

Bmob.initialize("cb918bec30eca29246f7101f5ffebafe", "bc68d3c114c13ec55fe79fbb7df3f166");

var app = new Vue({
    el: '#app',
    data: {
		mycounter: 0,
		username: '',
		password: '',
		is_login: false,
        count: 100,
        pagerows: 20,
        cols: 4,

		isadd: true,
		issub: true,
		ismul: false,
		isdiv: false,
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
			mulcnt: 0,
			divcnt: 0,
            borrowcnt: 0, // 借/进位题数量
            exceptcnt: 0 // 异常题数量(由于冲突，未能按规则生成)
        }
    },
    created: function() {
        this.itemcount = 2;
		this.is_login = this.curr_user() ? true : false;
		this.myCounter();
    },
    watch: {
		count: function(val, oldval) {
			if( val <  1 ) this.count = 1;
			if( val >  100000 ) this.count = 100000;
		},
		pagerows: function(val, oldval) {
			if( val <  1 ) this.pagerows = 1;
			if( val > 100 ) this.pagerows = 100;
		},
		cols: function(val, oldval) {
			if( val <  1 ) this.cols = 1;
			if( val >  10 ) this.cols = 10;
		},
		'result.min': function(val, oldval) {
			if( val <  0 ) this.result.min = 0;
		},
		'result.max': function(val, oldval) {
			if( val <  0 ) this.result.max = 0;
		},
		fontsize: function(val, oldval) {
			if( val <  1 ) this.fontsize = 1;
		},
		cellPadding: function(val, oldval) {
			if( val <  0 ) this.cellPadding = 0;
		},
		cellSpacing: function(val, oldval) {
			if( val <  0 ) this.cellSpacing = 0;
		},
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
			var ops = [];
			if(this.isadd) ops.push('+');
			if(this.issub) ops.push('-');
			if(this.ismul) ops.push('*');
			if(this.isdiv) ops.push('/');
			if( ops.length < 1 ) return '+';
			if( ops.length == 1 ) return ops[0];
			var rnd = parseInt(Math.random()  * 1000) % ops.length;
            return ops[rnd];
        },

        isValid: function(){
			if( ! (this.isadd || this.issub || this.ismul || this.isdiv ) ) {
				alert('必须至少指定一种运算符！');
				return false;
			}
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

            // 限制条件：
            // 1. 减法时必须保证第二个数必须比第一个数小，以避免产生负数结果
            // 2. 强制进位加法时，被加数个位必须不能为 0，否则无法产生进位，另外还要保证个位相加之和要大于 10
            // 3. 强制借位减法时，被减数个位必须不能为 9，并且不能小于 10，否则无法产生借位
            // 4. 强制借位减法时，首先必须保证被减数个位小于减数的个位，其次也必须保证减数总体小于被减数，以免产生负数
			// 5. 强制进、借位不对乘除法起作用
			// 6. 除法必须都能整除

            var w = ''===this.whichcond ?  randomInt(0, this.itemcount -1) : this.whichcond - 0; // 已知得数，随机求某一个条件
            var min = this.range[0].min, max = this.range[0].max, limit, isexcept = false, isborrow = false;
            var op = this.op(), t, r, res;

			// @todo: 确保第一个数生成在有解范围内！比如被加数 91 无法保证 加数 >= 10，
			//        比加数为 11，则
			//        如果第一个数随机得不合理，则后面可能无解！
			//        如果个位生成不合理，则后面则可能无法产生借、进位？
			var arr1, rg1;
			
			if( '+' == op ) {
				// 加法：根据结果和加数的限制范围，确定被加数的范围
				rg1 = {min: this.result.min - this.range[1].min, max: this.result.max - this.range[1].min};
			} else if( '-' == op ) {
				// 减法：根据结果和减数的限制范围，确定被减数的范围，确保能在最小的减数上能产生借位
				if( 'all' == this.borrow ) {
					min = Math.max(min, (this.range[1].min - 0) + (this.result.min - 0) + 10); // 强制借位时，必须比减数至少大 10 以上才行!
				} else {
					min = Math.max(min, (this.range[1].min - 0) + (this.result.min - 0)); // 被减数不允许比(减数+得数)还小，这会产生负数结果
				}
				rg1 = {min: (this.result.min - 0) + (this.range[1].min - 0), max: (this.result.max - 0) + (this.range[1].min - 0)};
			} else if( '*' == op ) {
				// 乘法：根据结果和乘数的限制范围，确定被乘数的范围 (注意除数不能为0)
				rg1 = {
					min: (this.range[1].min == 0 ? 0 : Math.round(this.result.min / this.range[1].min)), 
					max: (this.range[1].min == 0 ? this.result.max : Math.round(this.result.max / this.range[1].min))
				};
			} else if( '/' == op ) {
				// @todo 实现除法
				rg1 = {min: this.result.min - this.range[1].min, max: this.result.max - this.range[1].min};
			}

			// 可用范围与用户设置的范围求交集
			arr1 = [min - 0, max - 0, rg1.min, rg1.max].sort(function(a,b){return a-b;});
			min = arr1[1], max = arr1[2];

			//console.log(min, max, arr1);

            // 强制要带借/进位时，对被加/减数有要求
            if( 'all' == this.borrow ) {
                if( '+' == op ) {
                    limit = [0]; // 限制条件：有进位的被加数个位不能为 0.
                } else if( '-' == op ) {
                    min = Math.max(min, 10); // 强制借位减法，被减数不能小于 10，否则会产生负数结果
                    limit = [9]; // 限制条件：有借位的被减数个位不能为 9.
                } else {
					limit = []; // 乘除法对被乘数、被除数没有限制
				}
            }

			//
			// 先生成 r = “被加数"、"被减数"、"被乘数"、"被除数"
			//

            if( '+' == op ) {
                // 加法：数值 1 的最小值都超过了得数允许的最大值，则无法使用加法
                if( min > this.result.max ) {
                    // 智能处理：如果可以使用减法，尝试变更运算符？
                    if( this.issub ) {
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
					// 如果可以使用加法，尝试变更运算符？
                    if( this.isadd ) {
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
			else if( '*' == op ) {
				// 乘法：最小的积  比最大结果还大
                if( min > this.result.max ) {
                    if( this.issub ) {
                        console.warn('被乘数最小值超出了得数允许的最大范围，将智能变更为减法！')
                        op = '-';
                        r = randomInt(min, max, limit);
                    } else {
                        isexcept = true;
                        console.error('错误：被乘数最小值超出了得数允许的最大范围！')
                    }
				} else {
                    // 被乘数不能超过结果允许的最大值
                    max = Math.min(max, this.result.max);
					r = randomInt(min, max, limit);
				}
			}
			else if( '/' == op ) {
				// @todo 除法必须保证被除数能除得尽，不能有小数！
                // 除法：必须保证被除数不可小于允许结果的最小值
                if( max < this.result.min ) {
					// 如果可以使用加法，尝试变更运算符？
                    if( this.isadd ) {
                        console.warn('被除数最大值比得数允许的最小范围还要小，智能变更为加法！')
                        op = '+';
                        r = randomInt(min, max, limit);
                    } else {
                        isexcept = true;
                        console.error('错误：被除数最大值比得数允许的最小范围还要小！')
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


				// 根据已知的被加/减数、加/减数范围得到得数的范围，然后和用户设置的得数范围合并
				var rgc = {min: eval(r + op + this.range[i].min), max: eval(r + op + this.range[i].max)};
				var rgarr = [rgc.min - 0, rgc.max - 0, this.result.min - 0, this.result.max - 0].sort(function(a, b){
					return a - b;
				});
				// 取两个范围相交的部分
				var rgr = {min: rgarr[1], max: rgarr[2]};

				//console.log('rgr', rgr);

                // 先随机算出得数，再根据得数算出加数/减数 ...
                if( '+' == op ) {
                    // 加法结果范围：被加数(r) ~ rgr.max
                    min = Math.max(r, rgr.min);
                    max = rgr.max;
                    if( min > max ) {
                        console.error('错误：无法保证加法得数在设定范围内！');
                        max = min;
                        isexcept = true;
                    }
                    res = randomInt(min, max, undefined, res_ge);
                    t = res - r;
                }

                if( '-' == op ) {
                    // 减法结果范围：rgr.min ~ 被减数(r)
                    min = Math.max(0, rgr.min);
                    max = Math.min(r, rgr.max);
                    if( min > max ) {
                        console.error('错误：无法保证减法得数在设定范围内！');
                        min = max;
                        isexcept = true;
                    }
                    res = randomInt(min, max, undefined, res_ge);
                    t = r - res;
                }

                if( '*' == op ) {
                    // 乘法结果范围：被乘数(r) ~ rgr.max
                    min = Math.max(r, rgr.min);
                    max = rgr.max;
                    if( min > max ) {
                        console.error('错误：无法保证乘法得数在设定范围内！');
                        max = min;
                        isexcept = true;
                    }
					// @todo 要考虑结果得能除得尽被乘数才行
                    res = randomInt(min, max, undefined, res_ge);
					if( res % r != 0 ) {console.error(res, r, '除不尽');} // 除不尽也没事，后面会重算！就是结果可能超出范围！
					// 被乘数为 0? 乘数随机一个值！
					if( r == 0 ) t = randomInt(this.range[1].min, this.range[1].max); // 0 乘以 任何数都等于 0
					else t = Math.round(res / r); 
                }

				if( '/' == op ) {
                    // 除法结果范围：rgr.min ~ 被减数
                    min = Math.max(0, rgr.min);
                    max = Math.min(r, rgr.max);
                    if( min > max ) {
                        console.error('错误：无法保证除法得数在设定范围内！');
                        min = max;
                        isexcept = true;
                    }
                    res = randomInt(min, max, undefined, res_ge);
                    t = Math.round(r / res);
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
            arr.push(( /*true ||*/'2' == this.rule ) ? r : this.blank())

            this.report.addcnt += '+' == op ? 1 : 0;
            this.report.subcnt += '-' == op ? 1 : 0;
            this.report.mulcnt += '*' == op ? 1 : 0;
            this.report.divcnt += '/' == op ? 1 : 0;
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
            this.report.mulcnt = 0;
            this.report.divcnt = 0;
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
			//this.doAddData();
			//this.callServerCode();
        },

		doAddData: function() {
			var self = this;
			var GameScore = Bmob.Object.extend("GameScore");
			var gameScore = new GameScore();
			gameScore.set("score", 1337);
			gameScore.save(null, {
				success: function(object) {
					alert("create object success, object id:"+object.id);
					self.doGetData(object.id);
				},
				error: function(model, error) {
					alert("create object fail");
				}
			});
		},

		doGetData: function(obj_id) {
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get(obj_id, {
				success: function(object) {
					// The object was retrieved successfully.
					alert(object.get("score"));
				},
				error: function(object, error) {
					alert("query object fail");
				}
			});

		},

		myCounter: function() {
			var self = this;
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get('37bb7543a4', {
				success: function(object) {
					// The object was retrieved successfully.
					self.mycounter = object.get("mycounter");
					object.increment("mycounter");
					object.save(null, {
						success: function(objectUpdate) {
							self.mycounter = objectUpdate.get("mycounter");
						},
						error: function(model, error) {
							alert("create object fail");
						}
					});
				},
				error: function(object, error) {
					//alert("query object fail");
				}
			});
		},

		doEditData: function(obj_id) {
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get(obj_id, {
				success: function(object) {
					// The object was retrieved successfully.
					object.set("score", 1338);
					object.save(null, {
						success: function(objectUpdate) {
							alert("create object success, object score:"+objectUpdate.get("score"));
						},
						error: function(model, error) {
							alert("create object fail");
						}
					});
				},
				error: function(object, error) {
					alert("query object fail");
				}
			});
		},

		doDelData: function(obj_id) {
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get(obj_id, {
				success: function(object) {
					// The object was retrieved successfully.
					object.destroy({
						success: function(deleteObject) {
							alert("delete success");
						},
						error: function(GameScoretest, error) {
							alert("delete fail");
						}
					});
				},
				error: function(object, error) {
					alert("query object fail");
				}
			});
		},

		// 调用云端 node.js 逻辑，收费功能，免费 40 天
		callServerCode: function() {
			Bmob.Cloud.run('myfunc1', {"name":"tom"}, {
				success: function(result) {
					alert('得到结果' + result);
					console.log(result);
				},
				error: function(object, error) {
					alert('发生了错误' +  error.message);
				}
			});
		},

		register: function() {
			var self = this;
			if(!this.username || ! this.password) {
				alert('用户名、密码必须输入！');
				return;
			}
			var user = new Bmob.User();
			user.set("username", this.username);
			user.set("password", this.password);
			//user.set("email", "test@test.com");

			// other fields can be set just like with Bmob.Object
			//user.set("phone", "415-392-0202");

			user.signUp(null, {
				success: function(user) {
					// Hooray! Let them use the app now.
					self.is_login = self.curr_user() ? true : false;
					alert('注册成功!');
				},
				error: function(user, error) {
					// Show the error message somewhere and let the user try again.
					alert("Error: " + error.code + " " + error.message);
				}
			});
		},

		login: function() {
			var self = this;
			if(!this.username || ! this.password) {
				alert('用户名、密码必须输入！');
				return;
			}
			Bmob.User.logIn(this.username, this.password, {
				success: function(user) {
					// Do stuff after successful login.
					self.is_login = self.curr_user() ? true : false;
					alert('登录成功');
				},
				error: function(user, error) {
					// The login failed. Check error to see why.
					alert('登录失败' + error.message);
				}
			});
		},

		verify_email: function() {
			//reset password
			Bmob.User.requestEmailVerify("h6k65@126.com", {
				success: function() {
					// Password reset request was sent successfully
					alert('验证邮件发送成功！');
				},
				error: function(error) {
					// Show the error message somewhere
					alert("Error: " + error.code + " " + error.message);
				}
			});
		},

		reset_pwd: function() {
			Bmob.User.requestPasswordReset("test@126.com", {
				success: function() {
					// Password reset request was sent successfully
					alert('密码重置成功！');
				},
				error: function(error) {
					// Show the error message somewhere
					alert("Error: " + error.code + " " + error.message);
				}
			});
		},

		curr_user: function() {
			var currentUser = Bmob.User.current();
			if (currentUser) {
				// do stuff with the user
			} else {
				// show the signup or login page
			}
			return currentUser;
		},

		logout: function() {
			var self = this;
			Bmob.User.logOut();
			var currentUser = Bmob.User.current();  // this will now be null
			self.is_login = self.curr_user() ? true : false;
		},

        blank: function() {
            return '___';
        },

		myfmt: function(o) {
			return (o+'').replace('*', '×').replace('/','÷').replace('+','＋').replace('-', '－');
		}

    }
});

