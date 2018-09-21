

/**
 * 生成指定范围内的随机数
 * @param int Min 最小值
 * @param int Max 最大值
 * @param array[int] genotinarr 随机出的数值个位数必须不在 genotinarr 数组中
 * @param array[int] geinarr 随机出的数值个位数必须在 geinarr 数组中
 * @param array[int] notinarr 随机出的数值不可包含在 notinarr 数组中
 * @param array[int] inarr 只随机一个数组中的数值
 * @returns {number}
 */
function randomInt(Min, Max, genotinarr, geinarr, notinarr, inarr) {
	Min = parseInt(Min);
	Max = parseInt(Max);
	if( Max < Min ) Max = Min; // 保证范围有效！
	var Range = Max - Min;
	var Rand = Math.random();
	var num = Min + Math.round(Rand * Range);
	var i = 0;

	// if (typeof(genotinarr) != 'undefined' && genotinarr.length > 0) {
	// 	// 确保产生的随机数的个位数不在数组中
	// 	for (i = 0; genotinarr.indexOf(num % 10) >= 0 && i < 1000; i++) {
	// 		num = randomInt(Min, Max);
	// 	}
	// }
	// if (typeof(geinarr) != 'undefined' && geinarr.length > 0) {
	// 	// 确保产生的随机数的个位数存在于数组中
	// 	for (i = 0; geinarr.indexOf(num % 10) < 0 && i < 1000; i++) {
	// 		num = randomInt(Min, Max);
	// 	}
	// }
	// if (typeof(notinarr) != 'undefined' && notinarr.length > 0) {
	// 	for (i = 0; notinarr.indexOf(num) >= 0 && i < 1000; i++) {
	// 		num = randomInt(Min, Max);
	// 	}
	// }
	// if (typeof(inarr) != 'undefined' && inarr.length > 0) {
	// 	// @todo 确保数值满足条件？
	// 	num = randomInt(0, inarr.length - 1);
	// 	return inarr[num];
	// }

	for(i = 0; i < 1000; i ++) {
		// 必须是指定数值：
		if (typeof(inarr) != 'undefined' && inarr.length > 0) {
			num = 0 + Math.round(Math.random() * (inarr.length - 1 - 0));
			num = inarr[num];
		} else {
			num = Min + Math.round(Math.random() * (Max - Min));
		}
		// 个位不含：
		if (typeof(genotinarr) != 'undefined' && genotinarr.length > 0) {
			if( genotinarr.indexOf(num % 10) >= 0 ) {
				continue; // 不符合
			}
		}
		// 个位必含：
		if (typeof(geinarr) != 'undefined' && geinarr.length > 0) {
			if( geinarr.indexOf(num % 10) < 0 ) {
				continue; // 不符合
			}
		}
		// 不能是数值：
		if (typeof(notinarr) != 'undefined' && notinarr.length > 0) {
			if ( notinarr.indexOf(num) >= 0 ) {
				continue; // 不符合
			}
		}

		// 生成成功
		break;
	}

	if( 1000 == i ) console.error('    错误：未能生成范围('+Min+'~'+Max+')内的数值！',
		'个位不含('+ genotinarr.join(',')+')', '个位必含('+geinarr.join(',')+')', 
		'不含('+notinarr.join(',')+')', '必含('+inarr.join(',')+')');

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
		pagerows: 25,
		cols: 4,

		diff_operator_adjacent: false,
		dissimilarity_operator_adjacent: false,

		isadd: true,
		issub: true,
		ismul: true,
		isdiv: true,
		level: '20',
		rule: '1',
		whichcond: '',
		exact_parentheses: false,
		parentheses: {enabled: false, min: 0, max: 0}, // 是否生成带括号的题

		itemcount: 0,

		// 符号
		range_op: [],

		// 加法
		defrange_add: [{min: 0, max: 100}, {min: 0, max: 100}],
		result_add: {min: 0, max: 100},
		range_add: [],

		// 减法
		defrange_sub: [{min: 0, max: 100}, {min: 0, max: 100}],
		result_sub: {min: 0, max: 100},
		range_sub: [],

		// 乘法
		defrange_mul: [{min: 0, max: 9}, {min: 0, max: 9}],
		result_mul: {min: 0, max: 81},
		range_mul: [],

		// 除法
		defrange_div: [{min: 0, max: 81}, {min: 0, max: 9}],
		result_div: {min: 0, max: 9},
		range_div: [],

		borrow: 'random', // 减法借位设置
		carry: 'random', // 加法进位设置
		nomod: 'yes', // 除法余数设置
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
			borrowcnt: 0, // 借位题数量
			carrycnt: 0, // 进位题数量
			exceptcnt: 0 // 异常题数量(由于冲突，未能按规则生成)
		}
	},
	created: function () {
		this.itemcount = 3;
		this.is_login = this.curr_user() ? true : false;
		this.myCounter();
	},
	watch: {
		count: function (val, oldval) {
			if (val < 1) this.count = 1;
			if (val > 100000) this.count = 100000;
		},
		pagerows: function (val, oldval) {
			if (val < 1) this.pagerows = 1;
			if (val > 100) this.pagerows = 100;
		},
		cols: function (val, oldval) {
			if (val < 1) this.cols = 1;
			if (val > 10) this.cols = 10;
		},
		// 'result.min': function(val, oldval) {
		// 	if( val <  0 ) this.result.min = 0;
		// },
		// 'result.max': function(val, oldval) {
		// 	if( val <  0 ) this.result.max = 0;
		// },
		fontsize: function (val, oldval) {
			if (val < 1) this.fontsize = 1;
		},
		cellPadding: function (val, oldval) {
			if (val < 0) this.cellPadding = 0;
		},
		cellSpacing: function (val, oldval) {
			if (val < 0) this.cellSpacing = 0;
		},
		itemcount: function (val, oldval) {
			if (val < 2) {
				this.itemcount = 2;
				return;
			}
			if (val > 5) {
				this.itemcount = 5;
				return;
			}
			if (val > 2) {
				this.parentheses.enabled = true;
				if (this.parentheses.min < 0) this.parentheses.min = 0;
				if (this.parentheses.max < 0) this.parentheses.max = 0;
				if (this.parentheses.max > val - 1) this.parentheses.max = val - 1;
				if (this.parentheses.min > this.parentheses.max) this.parentheses.max = this.parentheses.max;
			} else {
				this.parentheses.enabled = false;
				this.parentheses.min = 0;
				this.parentheses.max = 0;
			}
			this.parentheses.enabled = val > 2;
			for (var i = 0; i < val; i++) {
				if (!this.range_op[i] && i < val - 1) {
					this.range_op.splice(i, 1, {
						add: true,
						sub: true,
						mul: true,
						div: true,
						parentheses: false,
						all: true
					});
				}
				if( i > 1 ) break; // 目前算法已经修改：只需要左|右两个运算项范围就行了，多了无用！
				if (!this.range_add[i]) {
					this.range_add.splice(i, 1, {
						min: (i > 0 ? this.defrange_add[1].min : this.defrange_add[0].min),
						max: (i > 0 ? this.defrange_add[1].max : this.defrange_add[0].max)
					});
				}
				if (!this.range_sub[i]) {
					this.range_sub.splice(i, 1, {
						min: (i > 0 ? this.defrange_sub[1].min : this.defrange_sub[0].min),
						max: (i > 0 ? this.defrange_sub[1].max : this.defrange_sub[0].max)
					});
				}
				if (!this.range_mul[i]) {
					this.range_mul.splice(i, 1, {
						min: (i > 0 ? this.defrange_mul[1].min : this.defrange_mul[0].min),
						max: (i > 0 ? this.defrange_mul[1].max : this.defrange_mul[0].max)
					});
				}
				if (!this.range_div[i]) {
					this.range_div.splice(i, 1, {
						min: (i > 0 ? this.defrange_div[1].min : this.defrange_div[0].min),
						max: (i > 0 ? this.defrange_div[1].max : this.defrange_div[0].max)
					});
				}
			}
			if (this.range_op.length > this.itemcount - 1) {
				this.range_op.splice(this.itemcount - 1);
			}
			if (this.range_add.length > this.itemcount) {
				this.range_add.splice(this.itemcount);
			}
			if (this.range_sub.length > this.itemcount) {
				this.range_sub.splice(this.itemcount);
			}
			if (this.range_mul.length > this.itemcount) {
				this.range_mul.splice(this.itemcount);
			}
			if (this.range_div.length > this.itemcount) {
				this.range_div.splice(this.itemcount);
			}
		}
	},
	methods: {
		op: function () {
			var ops = [];
			if (this.isadd) ops.push('+');
			if (this.issub) ops.push('-');
			if (this.ismul) ops.push('*');
			if (this.isdiv) ops.push('/');
			if (ops.length < 1) return '+';
			if (ops.length == 1) return ops[0];
			var rnd = parseInt(Math.random() * 1000) % ops.length;
			return ops[rnd];
		},

		isValid: function () {
			if (!(this.isadd || this.issub || this.ismul || this.isdiv)) {
				alert('必须至少指定一种运算符！');
				return false;
			}
			if (this.result_add.max - 0 < this.result_add.min - 0) {
				alert('加法得数范围无效！');
				return false;
			}
			if (this.result_sub.max - 0 < this.result_sub.min - 0) {
				alert('减法得数范围无效！');
				return false;
			}
			if (this.result_mul.max - 0 < this.result_mul.min - 0) {
				alert('乘法得数范围无效！');
				return false;
			}
			if (this.result_div.max - 0 < this.result_div.min - 0) {
				alert('除法得数范围无效！');
				return false;
			}
			for (var i = 0; i < this.itemcount; i++) {
				if( i > 1 ) break; // 目前算法已经修改：只需要左|右两个运算项范围就行了，多了无用！
				if (this.range_add[i].max - 0 < this.range_add[i].min - 0) {
					alert('加法数值' + (i + 1) + '范围无效！');
					return false;
				}
				if (this.range_sub[i].max - 0 < this.range_sub[i].min - 0) {
					alert('减法数值' + (i + 1) + '范围无效！');
					return false;
				}
				if (this.range_mul[i].max - 0 < this.range_mul[i].min - 0) {
					alert('乘法数值' + (i + 1) + '范围无效！');
					return false;
				}
				if (this.range_div[i].max - 0 < this.range_div[i].min - 0) {
					alert('除法数值' + (i + 1) + '范围无效！');
					return false;
				}
			}

			// @todo 其它非法检测 ...

			return true;
		},

		genItem: function () {

			// 限制条件：
			// 1. 减法时必须保证第二个数必须比第一个数小，以避免产生负数结果
			// 2. 强制进位加法时，被加数个位必须不能为 0，否则无法产生进位，另外还要保证个位相加之和要大于 10
			// 3. 强制借位减法时，被减数个位必须不能为 9，并且不能小于 10，否则无法产生借位
			// 4. 强制借位减法时，首先必须保证被减数个位小于减数的个位，其次也必须保证减数总体小于被减数，以免产生负数
			// 5. 强制进、借位不对乘除法起作用
			// 6. 除法必须都能整除
			var op = this.op(), t, r, res;

			var range = ({'+': this.range_add, '-': this.range_sub, '*': this.range_mul, '/': this.range_div})[op];
			var result = {'+': this.result_add, '-': this.result_sub, '*': this.result_mul, '/': this.result_div}[op];

			var w = '' === this.whichcond ? randomInt(0, this.itemcount - 1) : this.whichcond - 0; // 已知得数，随机求某一个条件
			var min = range[0].min, max = range[0].max, limit = [], isexcept = false, isborrow = false, iscarry = false;

			// @todo: 确保第一个数生成在有解范围内！比如被加数 91 无法保证 加数 >= 10，
			//        被加数为 11，则
			//        如果第一个数随机得不合理，则后面可能无解！
			//        如果个位生成不合理，则后面则可能无法产生借、进位？
			var arr1, rg1;

			if ('+' == op) {
				// 加法：根据结果和加数的限制范围，确定被加数的范围
				rg1 = {min: result.min - range[1].min, max: result.max - range[1].min};
			} else if ('-' == op) {
				// 减法：根据结果和减数的限制范围，确定被减数的范围，确保能在最小的减数上能产生借位
				if ('all' == this.borrow) {
					min = Math.max(min, (range[1].min - 0) + (result.min - 0) + 10); // 强制借位时，必须比减数至少大 10 以上才行!
				} else {
					min = Math.max(min, (range[1].min - 0) + (result.min - 0)); // 被减数不允许比(减数+得数)还小，这会产生负数结果
				}
				rg1 = {min: (result.min - 0) + (range[1].min - 0), max: (result.max - 0) + (range[1].min - 0)};
			} else if ('*' == op) {
				// 乘法：根据结果和乘数的限制范围，确定被乘数的范围 (注意除数不能为0)
				rg1 = {
					min: (range[1].min == 0 ? 0 : Math.round(result.min / range[1].min)),
					max: (range[1].min == 0 ? result.max : Math.round(result.max / range[1].min))
				};
			} else if ('/' == op) {
				// 除法：根据商和除数的限制范围，确定被除数的范围
				rg1 = {
					min: Math.round(result.min * range[1].min),
					max: Math.round(result.max * range[1].max)
				};
			}

			// 数值 1 范围 = 可用范围与用户设置的范围求交集
			arr1 = [min - 0, max - 0, rg1.min, rg1.max].sort(function (a, b) {
				return a - b;
			});
			min = arr1[1], max = arr1[2];

			//console.log(min, max, arr1);

			// 强制进位时，对被加数要求
			if ('all' == this.carry) {
				if ('+' == op) {
					limit = [0]; // 限制条件：有进位的被加数个位不能为 0.
				}
			}

			// 强制要借位时，对被减数有要求
			if ('all' == this.borrow) {
				if ('-' == op) {
					min = Math.max(min, 10); // 强制借位减法，被减数不能小于 10，否则会产生负数结果
					limit = [9]; // 限制条件：有借位的被减数个位不能为 9.
				}
			}

			//
			// 先生成 r = “被加数"、"被减数"、"被乘数"、"被除数"
			//

			if ('+' == op) {
				// 加法：数值 1 的最小值都超过了得数允许的最大值，则无法使用加法
				if (min > result.max) {
					// 智能处理：如果可以使用减法，尝试变更运算符？
					if (this.issub) {
						console.warn('被加数最小值超出了得数允许的最大范围，将智能变更为减法！')
						op = '-';
						r = randomInt(min, max, limit);
					} else {
						isexcept = true;
						console.error('错误：被加数最小值超出了得数允许的最大范围！')
					}
				} else {
					// 被加数不能超过结果允许的最大值
					max = Math.min(max, result.max);
					r = randomInt(min, max, limit);
				}
			}
			else if ('-' == op) {
				// 减法：必须保证被减数不可小于允许结果的最小值
				if (max < result.min) {
					// 如果可以使用加法，尝试变更运算符？
					if (this.isadd) {
						console.warn('被减数最大值比得数允许的最小范围还要小，智能变更为加法！')
						op = '+';
						r = randomInt(min, max, limit);
					} else {
						isexcept = true;
						console.error('错误：被减数最大值比得数允许的最小范围还要小！')
					}
				} else {
					min = Math.max(min, result.min);
					r = randomInt(min, max, limit);
				}
			}
			else if ('*' == op) {
				// 乘法：最小的积  比最大结果还大
				if (min > result.max) {
					if (this.issub) {
						console.warn('被乘数最小值超出了得数允许的最大范围，将智能变更为减法！')
						op = '-';
						r = randomInt(min, max, limit);
					} else {
						isexcept = true;
						console.error('错误：被乘数最小值超出了得数允许的最大范围！')
					}
				} else {
					// 被乘数不能超过结果允许的最大值
					max = Math.min(max, result.max);
					r = randomInt(min, max, limit);
				}
			}
			else if ('/' == op) {
				// @todo 除法必须保证被除数能除得尽，不能有小数！要做整除？
				// 除法：必须保证被除数不可小于允许结果的最小值
				if (max < result.min) {
					if (this.ismul) {
						console.warn('被除数最大值比得数允许的最小范围还要小，智能变更为乘法！')
						op = '*';
						r = randomInt(min, max); // 随机生成被乘数
					} else {
						isexcept = true;
						console.error('错误：被除数最大值比得数允许的最小范围还要小！')
					}
				} else {
					r = randomInt(min, max, [], [], [0]); // 随机生成被除数
				}
			}

			// 如果前面无法生成合法的数值，这里就直接按数值 1 限定范围生成随机数即可！因为无论如何它将是一个异常的值！
			if ('undefined' == typeof(r)) {
				r = randomInt(range[0].min, range[0].max, limit);
			}

			// 已知得数，求条件，且第一个数就是被求的条件? 则将该数使用空白代替！
			var arr = [('2' == this.rule && 0 == w) ? this.blank(r) : r];
			for (var i = 1; i < this.itemcount; i++, op = this.op()) {

				// 强制借/进位时，因为被加/减数的个位已经确定，所以加数的个位取值范围也确定了
				var ge = r % 10, res_ge = [];

				min = 0;
				if ('all' == this.carry && '+' == op) min = 10 - ge; // 强制进位加法：计算出要产生进位的加数最小值
				else if ('all' == this.borrow && '-' == op) min = ge + 1; // 强制借位减法：计算出要产生借位的减数最小值

				max = 9;
				if ('no' == this.carry && '+' == op) max = 9 - ge; // 强制不进位加法：计算出加数最大值
				else if ('no' == this.borrow && '-' == op) max = ge; // 强制不借位减法：计算出减数最大值

				// min = ('all' == this.borrow) ? ('+' == op ? 10 - ge : ge + 1) : 0; // 强制借/进位
				// max = ('no' == this.borrow) ? ('+' == op ? 9 - ge : ge) : 9; // 强制不借/进位
				for (var j = min; j <= max; j++) {
					res_ge.push('+' == op ? (ge + j) % 10 : (ge + 10 - j) % 10);
				}

				// 根据已知的被加/减数、加/减数范围得到得数的范围，然后和用户设置的得数范围合并
				var rgc = {min: eval(r + op + range[i].min), max: eval(r + op + range[i].max)};
				var rgarr = [rgc.min - 0, rgc.max - 0, result.min - 0, result.max - 0].sort(function (a, b) {
					return a - b;
				});
				// 取两个范围相交的部分
				var rgr = {min: rgarr[1], max: rgarr[2]};

				//console.log('rgr', rgr);

				// 先随机算出得数，再根据得数算出加数/减数/除数 ...
				if ('+' == op) {
					// 加法结果范围：被加数(r) ~ rgr.max
					min = Math.max(r, rgr.min);
					max = rgr.max;
					if (min > max) {
						console.error('错误：无法保证加法得数在设定范围内！');
						max = min;
						isexcept = true;
					}
					res = randomInt(min, max, undefined, res_ge);
					t = res - r;
				}

				if ('-' == op) {
					// 减法结果范围：rgr.min ~ 被减数(r)
					min = Math.max(0, rgr.min);
					max = Math.min(r, rgr.max);
					if (min > max) {
						console.error('错误：无法保证减法得数在设定范围内！');
						min = max;
						isexcept = true;
					}
					res = randomInt(min, max, undefined, res_ge);
					t = r - res;
				}

				if ('*' == op) {
					// 乘法结果范围：被乘数(r) ~ rgr.max
					min = Math.max(r, rgr.min);
					max = rgr.max;
					if (min > max) {
						console.error('错误：无法保证乘法得数在设定范围内！');
						max = min;
						isexcept = true;
					}
					// @todo 要考虑结果得能除得尽被乘数才行
					res = randomInt(min, max, undefined, res_ge);
					if (res % r != 0) {
						console.error(res, r, '除不尽');
					} // 除不尽也没事，后面会重算！就是结果可能超出范围！
					// 被乘数为 0? 乘数随机一个值！
					if (r == 0) t = randomInt(range[i].min, range[i].max); // 0 乘以 任何数都等于 0
					else t = Math.round(res / r);
				}

				if ('/' == op) {
					// @todo 除法忽略被除数范围？
					// 除法结果范围：rgr.min ~ 被减数
					min = Math.max(0, rgr.min);
					max = Math.min(r, rgr.max);
					if (min > max) {
						console.error('错误：无法保证除法得数在设定范围内！');
						min = max;
						isexcept = true;
					}
					// 先随机生成【商】res，然后再重随机得到【除数】t，这样才能修正【被除数】r 以实现整除
					// r / t = res 
					res = (0 == r) ? 0 : randomInt(min, max, [], [], [0]); // 随机生成商
					if (0 == res) { // 如果商为 0?
						// 由于 0 除以 任何数都等于 0，所以这里随便生成一个范围内的除数，但除数不能为 0
						t = randomInt(range[i].min, range[i].max, [], [], [0]);
					} else {// 如果商不为零？
						t = randomInt(range[i].min, range[i].max, [], [], [0]); // 除数不零为 0
					}

					// @todo 在连式运算中 r 被修正可能会出问题，因为 r 是前面算式的结果 ...
					if (this.nomod == 'yes' && range.length < 3) {
						// 确保能除尽(所以要重新修正【被除数】 r = t * res)，有可能导致被除数超出设定范围
						arr[arr.length - 1] = r = res * t;
					} else {
						// 非除尽? 保持【被除数】r 和【商】res 不变，重新计算 t，但这样做有可能让 t 超出它的限制范围!(从而可能违背 10 以内的限制条件)
						// 还是修正【被除数】 r 吧？ 并且需要随机模拟除不尽的情况
						arr[arr.length - 1] = r = res * t + (res ? randomInt(0, t - 1) : 0);
					}
					console.log('r=', r, 't=', t, 'res=', res);
				}

				if (t < range[i].min || t > range[i].max) {
					console.error('错误：为保证得数在范围内，加数/减数将超出范围！', t, range[i].min, range[i].max);
					isexcept = true;
				}

				if ('all' == this.carry) {
					if ('+' == op && r % 10 + t % 10 < 10) {
						console.error('错误：未能生成进位！', r, JSON.stringify(res_ge), t, res);
						isexcept = true;
					}
				}
				if ('all' == this.borrow) {
					if ('-' == op && r % 10 >= t % 10) {
						console.error('错误：未能生成借位！', r, JSON.stringify(res_ge), t, res);
						isexcept = true;
					}
				}

				if ('+' == op && r % 10 + t % 10 >= 10) iscarry = true; // 有进位
				if ('-' == op && r % 10 < t % 10) isborrow = true; // 有借位

				// 已知得数，求条件时，将条件换成空白
				arr.push(op); // 运算符号
				arr.push(('2' == this.rule && i == w) ? this.blank(t) : t);

				// 计算得数
				r = Math.floor(eval(r + op + t));
			}

			// 得数
			arr.push('=');
			arr.push((/*true ||*/'2' == this.rule) ? r : this.blank(r))

			this.report.addcnt += '+' == op ? 1 : 0;
			this.report.subcnt += '-' == op ? 1 : 0;
			this.report.mulcnt += '*' == op ? 1 : 0;
			this.report.divcnt += '/' == op ? 1 : 0;
			this.report.carrycnt += iscarry ? 1 : 0;
			this.report.borrowcnt += isborrow ? 1 : 0;
			this.report.exceptcnt += isexcept ? 1 : 0;

			return arr;
		},

		/**
		 * @todo - 1: 由于除法和减法在多个运算符时会越减（或除）越小，是否应该考虑？
		 * @todo - 2: 不加括号时，乘除法是优先算的，可否总是先生成乘除法，再生成加减法，等最后再随机变换等式？
		 * @todo - 3: 或者总是生成两个运算项，然后再根据运算符的多少，随机拆分运算项？然后再做等价变换，并加括号？
		 *            例：    67－63÷9=___，应该是先随机生成了一道减法：
		 *            1) 67 - 7 = 60 // 先随机结果
		 *            2)    7 = 63 ÷ 9 // 拆分第2个运算项
		 *            3) 67 - (63 ÷ 9) = 60 // 生成式子
		 *            例： 67-63÷9+45=105，4个运算项，3个运算符
		 *            1) 60 + 45 = 105 // 先随机结果
		 *            2)   60 = 67 - 7 // 拆分第 1 个运算项
		 *            3)   7 = 63 ÷ 9 // 继续拆分第 2 个运算项
		 *            4) (67 - (63 ÷ 9)) + 45 = 105 // 生成式子
		 *            5) 45 + 67 - 63 ÷ 9 = 105 开没用的括号和等价随机变换
		 *            分析：
		 *                如果总是先生成结果，再拆分算式项，进位、借位、余数是否可以解决？
		 * @todo - 4: 加减法的运算结果范围，是否会乘除法的运算项范围冲突？
		 * @todo - 5: 加减法的运算结果范围，是否会与除法要求整除相冲突？
		 * @todo - 6: 运算结果范围，是否会总是进位、借位、带余数 相冲突？
		 *            例如：强制进位、借位、不带余数，四个运算项时：
		 *            1) 63 ÷ 9 = 7 // 不带余数
		 *            2) 63 ÷ (222 - 213) = 7 // 折分运算项2，强制借位
		 *            3) 63 ÷ ((114 + 108) - 13) = 7 // 折分运算项1，强制进位
		 *            4) 63 ÷ (114 + (108 - 13)) = 7
		 *            分析：
		 *                这说明运算符的顺序是随机的？无法强制指定运算符的顺序？
		 *
		 */

		/**
		 * 根据两项式的运算符、运算结果和其中一项运符项的值，求另个运算项的值
		 * @param object item 两项式对象
		 * @param int item1_val 运算项1的值
		 * @return int item2_val 返回另一运算项的值
		 */
		calcItem2Value: function (item, item1_val) {
			var dst_lor = 'lft' == item.lor ? 'rgt': 'lft';
			var range, notinarr;

			if ('+' == item.operator) {
				return item.result - item1_val;
			}

			if ('-' == item.operator) {
				if ('lft' == item.lor) return item1_val - item.result;
				if ('rgt' == item.lor) return item1_val + item.result;
			}

			if ('*' == item.operator) {
				// 特殊情况：其中一个因子已经是 0 的情况，另一个则随机生成一个，避免生成 "0*0=0" 的形式
				if (0 == item1_val) {
					var range = this.getItemLORRange(item, dst_lor);
					var notinarr = [0];
					return randomInt(range.min, range.max, [], [], notinarr);
				} else {
					return item.result / item1_val;
				}
			}

			if ('/' == item.operator) {
				if ('lft' == item.lor) {
					// 已知被除数、商求除数，则：除数 = 被除数 / 商
					if( (item.result == 0 && item1_val != 0) || (item.result != 0 && item1_val == 0) ) {
						console.error('    错误：被除数和商都应该是 0, 但被除数 =', item1_val, ', 商 =', item.result);
					}
					// 特殊情况：当被除数或者商为 0 时，除数无法计算，只能随机生成一个
					if (item1_val == 0 || item.result == 0) {
						var range = this.getItemLORRange(item, dst_lor);
						var notinarr = [0];
						return randomInt(range.min, range.max, [], [], notinarr);
					}
					return item1_val / item.result;
				}
				if ('rgt' == item.lor) {
					if( 0 == item1_val ) {
						console.error('    错误：被除数 == 0 了？');
					}
					return item1_val * item.result;
				}
			}
		},

		/**
		 * 根据两项式的运算符获取两项式中其中一个运算项的取值范围（用户在界面中设定）
		 * @param object item 两项式对象
		 * @param string lor 取值 'lft' | 'rgt'，代表两项式运算符左边|右边的运算项
		 * @return json 返回 {min: <最小值>, max: <最大值>}
		 */
		getItemLORRange: function (item, lor) {
			var op_ranges = {'+': this.range_add, '-': this.range_sub, '*': this.range_mul, '/': this.range_div};
			var subi = 'lft' == lor ? 0 : 1;
			return op_ranges[item.operator][subi];  // 只使用了 0, 1 范围来代表左、右范围？
		},

		/**
		 * 根据两项式的运算符获取两项式结果的取值范围（用户在界面中设定）
		 * @param object item 两项式对象
		 * @return json 返回 {min: <最小值>, max: <最大值>}
		 */
		getItemResultRange: function(item) {
			var result_range = { '+': this.result_add, '-': this.result_sub, '*': this.result_mul, '/': this.result_div }[item.operator];
			return result_range;
		},

		/**
		 * 随机生成第 index 个运算符
		 * @param int index 指示要随机生成的第几个运算符
		 * @return string 返回值：'+' | '-' | '*' | '/'
		 */
		genOperator: function (index, prev_operator) {
			var ops = [];
			if (this.isadd && this.range_op[index].add) ops.push('+');
			if (this.issub && this.range_op[index].sub) ops.push('-');
			if (this.ismul && this.range_op[index].mul) ops.push('*');
			if (this.isdiv && this.range_op[index].div) ops.push('/');
			// 有选择空间才进行？
			if( prev_operator && ops.length > 1 ) {
				// 加减不相邻，乘除不相邻
				if( this.dissimilarity_operator_adjacent ) {
					var arr = [];
					if( '+-'.indexOf(prev_operator) >= 0 ) {
						for(var i = 0; i < ops.length; i ++) {
							if( '*/'.indexOf(ops[i]) >= 0 ) {
								arr.push(ops[i]);
							}
						}
					} else {
						for(var i = 0; i < ops.length; i ++) {
							if( '+-'.indexOf(ops[i]) >= 0 ) {
								arr.push(ops[i]);
							}
						}
					}
					ops = arr;
				} 
				// 相邻的运算符不相同
				else if( this.diff_operator_adjacent ) {
					var arr = [];
					for(var i = 0; i < ops.length; i ++) {
						if( prev_operator !=  ops[i] ) {
							arr.push(ops[i]);
						}
					}
					ops = arr;
				}
			}
			if (ops.length < 1) return '+';
			if (ops.length == 1) return ops[0];
			var rnd = parseInt(Math.random() * 1000) % ops.length;
			return ops[rnd];
		},

		// 1. 连加强制进位时，内层比外层每层 大 10? 否则会出现 x + ? + ? = 15 的情况？
		calcCarryAddMinResult: function(items, index) {
			var min = 0;
			var genotinarr = [];
			var tmp = 9;
			for(var i = index; i < items.length && '+' == items[i].operator; i ++, tmp --) {
				min += 10;
				genotinarr.push(tmp); // 要想进位：几个连加时 [..., 7,8,9] 个位不能为，否则内存可能无法满足条件
			}
			return {min:min, genotinarr:genotinarr};
		},

		calcBorrowSub: function(items, index) {
			var tmp = 0;
			var genotinarr = [];
			for(var i = index; i < items.length && '-' == items[i].operator; i ++, tmp ++) {
				genotinarr.push(tmp); // 要想进位：几个连加时 [0, 1,2, ...] 个位不能为，否则内存可能无法满足条件
			}
			return {genotinarr:genotinarr};
		},

		/**
		 * 随机为两项式生成一个在范围内的结果值（注意：本层结果值 == 父层左|右运算项值）
		 * @param json item 本层两项式对象
		 * @param null|json parent 父层两项式对象，顶层入为 null
		 * @return int 根据当前配置的用户选项和结果范围，返回一个合理的两项式结果
		 */
		genResult: function (item, parent, items) {
			// 先按本层的运算符取得结果的允许范围:
			var result_range = this.getItemResultRange(item);
			var result, min = result_range.min, max = result_range.max;

			var genotinarr = [], notinarr = [];
			// @todo 结果在某些情况下也要受到限制：

			if( '+' == item.operator && 'all' == this.carry ) {
				var tmpobj = this.calcCarryAddMinResult(items, item.index);
				genotinarr = tmpobj.genotinarr; // 加法：强制进位，结果个位不能为 9，因为要产生进位 9 + 9 最大个位为 8；
				var minVal = tmpobj.min;
				if( min < minVal ) { // 加法：强制进位，结果至少是 10 及以上
					min = minVal;
					if( min > max ) max = min;
				}
			} else if( '-' == item.operator && 'all' == this.borrow ) {
				var tmpobj = this.calcBorrowSub(items, item.index);
				genotinarr = tmpobj.genotinarr; // 减法：强制借位，结果个位数不能为 0
				notinarr = tmpobj.genotinarr; // 减法：强制借位，结果不能为 0
			} else {
				// 乘除法对结果没有限制要求？
				// 乘法时要不要尽量避免生成范围内的素数？
			}

			// 顶层结果在此生成：
			if ( 0 == item.index ) {
				// 最外层结果 = 只要在最外层运算符规定的范围内就行
				result = randomInt(min, max, genotinarr, [], notinarr, []);
			} 
			// 非顶层要考虑本层和父层两个范围的合并问题：
			else {
				// 则再按父层运算符项确定父层左|右值的范围，并与当前层结果范围求交集，以尽量保证数值在允许的范围内：
				var parent_lor_range = this.getItemLORRange(parent, parent.lor);
				// 放到一起升序排列
				var arr1 = [min - 0, max - 0, parent_lor_range.min, parent_lor_range.max].sort(function (a, b) {
					return a - b;
				});
				if( min > parent_lor_range.max || parent_lor_range.min > max) {
					// 此时只能尽量满足范围小的一层的要求，以小的范围为准？
					min = arr1[0], max = arr1[1];
					console.warn('    警告：父层左|右值范围与当前层结果范围无交集：', JSON.stringify(parent_lor_range), JSON.stringify(result_range));
				} else {
					// 有交集，则求出交集范围
					min = arr1[1], max = arr1[2];
					console.info('    提示：父层左|右值范围与当前层结果范围交集为：', JSON.stringify(arr1));
				}
				// 子层结果 = 父层的左（或右）值，但结果范围是本层运算符所规定的结果范围，而不是父层的范围
				result = this.genItemLORByRange(parent, {min:min, max:max, genotinarr:genotinarr, notinarr:notinarr});
			}
			console.log('genResult%c-'+item.index+' %c'+item.lor, 'color:red', 'color:darkgreen',
				(item.lor=='lft'?'?':'x')+item.operator+(item.lor=='rgt'?'?':'x')+'=',result, '('+result+'='+min+'~'+max+')');
			return result;
		},

		/**
		 * 根据当前选项为两项式生成在用户规定范围内的左|右值
		 * @param json item 两项式对象
		 * @return int 合法值
		 */
		genItemLOR: function (item) {
			var range = this.getItemLORRange(item, item.lor);
			var val = this.genItemLORByRange(item, range);
			if( isNaN(val) ) {
				console.error('genItemLOR error:', val, JSON.stringify(item));
			} else {
				console.log('genItemLOR%c-'+item.index+' %c'+item.lor, 'color:red', 'color:darkgreen', (item.lor=='lft'?val:'x')+item.operator+(item.lor=='rgt'?val:'x')+'='+item.result, '('+val+'='+range.min+'~'+range.max+')');
			}
			return val;
		},

		// 根据已知条件：运算符号、结果，
		// 随机生成 index 层的左（或右）值，并尽量保证数值在规定的范围内
		genItemLORByRange: function (item, range) {
			var min = range.min, max = range.max;
			var genotinarr = range.genotinarr || [];
			var geinarr = range.geinarr || [];
			var notinarr = range.notinarr || [];
			var inarr = range.inarr || [];
			var old_min = min, old_max = max;

			if ('+' == item.operator) {
				// 限制：不管是被加数还是加数都不允许超过 item.result 的值
				if (max > item.result) {
					max = item.result; 
					if( min > max ) min = max; // 重新修正 min 由于 max 变化
					console.warn('    重新修正了范围（加法项必须小于结果）：', old_min, old_max, min, max);
				}
				if ('all' == this.carry) { // 强制进位
					if( item.result % 10 == 9 ) {
						console.error('    错误：加法强制进位时，结果个位数不能为9。')
					}
					// 加法强制进位时，由于得数已经确定，运算项个位数必须至少比结果个位数大 1。
					for(var i = item.result % 10 + 1; i <= 9; i ++) {
						geinarr.push(i);
					}
				}
			}

			if ('-' == item.operator) {
				if( 'lft' == item.lor ) {
					// 被减数限制：为确保减法结果不为负数，被减数必须大于 item.result 才行
					if (min < item.result) {
						min = item.result;
						if( min > max ) max = min; // 重新修正 max 由于 min 变化
						console.warn('    重新修正了范围（被减数必须大于结果）：', old_min, old_max, min, max);
					}
				}
				if ('all' == this.borrow) { // 强制借位
					if( item.result % 10 == 0 ) {
						console.error('    错误：减法强制借位时结果个位不能为 0');
					}
					if ('lft' == item.lor) {
						if (min < 10) {
							min = 10; // 强制借位时被减数必须大于 10 结果才不会为负数
							if( min > max ) max = min; // 重新修正 max 由于 min 变化
							console.warn('    重新修正了范围（被减数必须大于10）：', old_min, old_max, min, max);
						}
						// 由于结果已经确定，此时要产生借位的被减数个位也应该确定：
						for(var i = 0; i < item.result % 10; i ++) {
							geinarr.push(i);
						}
					}
					if( 'rgt' == item.lor ) {
						// 由于结果已经确定，此时要产生借位的减数个位也应该确定：
						for(var i = 0; i < item.result % 10; i ++) {
							geinarr.push(10 + i - (item.result % 10));
						}
					}
				}
			}

			if ('*' == item.operator) {
				if( 0 != item.result) {
					notinarr.push(0); // 注意：要避免产生：0 * ? = 95 的情况？
				}
				if( 'yes' == this.nomod ) {
					// 生成的数必须能被 item.result 整除，找出所有能被 result 整除的数
					if( 0 == item.result ) inarr.push(0); // @todo 是否需要 0? 要避免产生： 0 * ? = 95 的情况？
					for(var i = 1; i <= item.result; i ++) {
						if( item.result % i == 0 ) {
							inarr.push(i);
							inarr.push(i); // 小技巧：加两次被随机到的可能性大些，以尽量减少 1 * n 和 n * 1 的机率
						}
					}
				}
				if (max > item.result) {
					max = item.result; // 乘法因子不允许超过乘积，否则另一个因子会变成小数
					if( min > max ) min = max;
					console.warn('    重新修正了范围（乘法项不能大于结果）：', old_min, old_max, min, max);
				}
			}

			// @todo 除法要尽量保证除数也在范围内？

			if ('/' == item.operator) {
				if ('rgt' == item.lor) {
					notinarr.push(0); // 注意：要避免产生 ? / 0 = ? 的情况，除数不能为 0
				} 
				if( 'lft' == item.lor ) {
					if( 0 == item.result ) return 0; // 0 / ? = 0, 如果除法结果是 0，则被除数只能是 0，没有随机的空间
					if ('yes' == this.nomod) {
						// 为了确保被除数能被除尽，被除数必须是商(item.result)的整数倍
						var max_times = parseInt(max / item.result); // 最大倍数
						if(max_times < 1 ) max_times = 1;
						for(var i = 1; i <= max_times; i ++) {
							inarr.push(i * item.result);
						}
					}
				}
			}

			return randomInt(min, max, genotinarr, geinarr, notinarr, inarr);
		},

		randomLOR: function () {
			return randomInt(0, 1000) % 2 == 1 ? 'lft' : 'rgt';
		},

		// 返回一个一维数组，按顺序包含每个运算符和运算项
		// @todo 拆分时，无法确定结果范围了? 因为结果是前面生成好的？ 假如前面加法结果是 99 而后面符号是除法，这就可能超出除法结果在 0-9 以内的限制？
		// @todo
		// @todo 能否从后往前生成，先一次性按要求生成所有运算符，然后再从最后一个结果开始回溯，然后每次回溯的已知条件是其中一个运算符运算项和得数范围？

		/**
		 *
		 * @param int index 第几个运算符
		 * @param string lor 目前是左值还是右值(lft:左值, rgt:右值)
		 * @param array operators 所有运算符
		 * @param result
		 * @returns {Array}
		 */
		genFormulaItem2: function (index, lor, items) {
			if (!index) {
				index = 0;
				lor = 'lft';
				// 1. 首先一次性按要求生成所有的运算符
				items = [];
				for (var i = 0; i < this.itemcount - 1; i++) {
					items[i] = {
						"index": i,
						"lor": this.randomLOR(),
						"lft": 0,
						"operator": this.genOperator(i, (i>0?items[i-1].operator:'')),
						"rgt": 0,
						"result": 0
					};

					// @todo 除法要尽量保证除数也在范围内？
					if( '/' == items[i].operator ) {
						items[i].lor = 'rgt'; // 总是随机除数？以尽可能避免出现: 80 / 40 = 2 的情况？
					}
				}
			}

			var item_lft, item_rgt;
			var parent = index > 0 ? items[index - 1] : null;

			// 先为本 index 层预先生成一个结果，同时也会作为父层左、右值（本层结果 = 父层左、右值）：
			items[index].result = this.genResult(items[index], parent, items); // 先根据运算符和结果范围随机生成结果

			// 先一直递归直到最后一项时才开始生成并回溯
			if (index < this.itemcount - 2) {
				// 先算子项，然后再根据子项的 result 来求本项的左、右值：
				this.genFormulaItem2(index + 1, items[index].lor, items);
				var child = items[index + 1];
				if ('lft' == items[index].lor) {
					item_lft = child.result; // 左值确定，计算右值
					item_rgt = this.calcItem2Value(items[index], item_lft);
				} else {
					item_rgt = child.result; // 右值确定，计算左值
					item_lft = this.calcItem2Value(items[index], item_rgt);
				}
			} else {
				// 这是最后的一层算式：
				if ('lft' == items[index].lor) {
					// 随机本层左值，计算右值
					item_lft = this.genItemLOR(items[index]); // 3. 确定运算项#1
					item_rgt = this.calcItem2Value(items[index], item_lft);
				} else if ('rgt' == items[index].lor) {
					// 随机本层右值，计算左值
					item_rgt = this.genItemLOR(items[index]); // 4. 确定运算项#2
					item_lft = this.calcItem2Value(items[index], item_rgt);
				}
			}

			// 乘法可能有除不尽的情况，此时重新修正一下得数，以供上级使用？
			if ('*' == items[index].operator && 'yes' == this.nomod) {
				items[index].result = parseInt(item_lft) * parseInt(item_rgt);
			}

			items[index].lft = parseInt(item_lft);
			items[index].rgt = parseInt(item_rgt);

			return items;
		},

		debugOutput: function (items) {
			var str = '', tmpstr = '';
			console.info('debugOutput:', items.length, JSON.stringify(items));
			for (var i = items.length - 1; i >= 0; i--) {
				var lft, rgt, result;
				var head = 0 == i ? '' : '(';	
				var tail = 0 == i ? '' : ')';	
				if (i == items.length - 1) {
					str = head + items[i].lft + items[i].operator + items[i].rgt + tail;
				} else {
					if ('lft' == items[i].lor) {
						str = head + str + items[i].operator + items[i].rgt + tail;
					} else {
						str = head + items[i].lft + items[i].operator + str + tail;
					}
				}

			}
			str += '=' + items[0].result;
			console.log(str);
		},

		doGen: function () {
			if (!this.isValid()) {
				return;
			}
			this.report.total = 0;
			this.report.addcnt = 0; // 加法题数量
			this.report.subcnt = 0; // 减法题数量
			this.report.mulcnt = 0;
			this.report.divcnt = 0;
			this.report.carrycnt = 0; // 进位题数量
			this.report.borrowcnt = 0; // 借位题数量
			this.report.exceptcnt = 0; // 异常题数量(由于冲突，未能按规则生成)
			this.res = [];
				return this.debugOutput(this.genFormulaItem2());
			for (var i = 0; i < this.count; i++) {
				var item = {
					li: this.genItem()
				};
				this.res.push(item);
				break;// 测试时只生成一个
			}
		},

		doPrint: function () {
			if (window.document.all && window.ActiveXObject && !window.opera) {
				window.document.all.WebBrowser.ExecWB(7, 1);
			} else {
				window.print();
			}
			//this.doAddData();
			//this.callServerCode();
		},

		doAddData: function () {
			var self = this;
			var GameScore = Bmob.Object.extend("GameScore");
			var gameScore = new GameScore();
			gameScore.set("score", 1337);
			gameScore.save(null, {
				success: function (object) {
					alert("create object success, object id:" + object.id);
					self.doGetData(object.id);
				},
				error: function (model, error) {
					alert("create object fail");
				}
			});
		},

		doGetData: function (obj_id) {
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get(obj_id, {
				success: function (object) {
					// The object was retrieved successfully.
					alert(object.get("score"));
				},
				error: function (object, error) {
					alert("query object fail");
				}
			});

		},

		myCounter: function () {
			var self = this;
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get('37bb7543a4', {
				success: function (object) {
					// The object was retrieved successfully.
					self.mycounter = object.get("mycounter");
					object.increment("mycounter");
					object.save(null, {
						success: function (objectUpdate) {
							self.mycounter = objectUpdate.get("mycounter");
						},
						error: function (model, error) {
							alert("create object fail");
						}
					});
				},
				error: function (object, error) {
					//alert("query object fail");
				}
			});
		},

		doEditData: function (obj_id) {
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get(obj_id, {
				success: function (object) {
					// The object was retrieved successfully.
					object.set("score", 1338);
					object.save(null, {
						success: function (objectUpdate) {
							alert("create object success, object score:" + objectUpdate.get("score"));
						},
						error: function (model, error) {
							alert("create object fail");
						}
					});
				},
				error: function (object, error) {
					alert("query object fail");
				}
			});
		},

		doDelData: function (obj_id) {
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get(obj_id, {
				success: function (object) {
					// The object was retrieved successfully.
					object.destroy({
						success: function (deleteObject) {
							alert("delete success");
						},
						error: function (GameScoretest, error) {
							alert("delete fail");
						}
					});
				},
				error: function (object, error) {
					alert("query object fail");
				}
			});
		},

		// 调用云端 node.js 逻辑，收费功能，免费 40 天
		callServerCode: function () {
			Bmob.Cloud.run('myfunc1', {"name": "tom"}, {
				success: function (result) {
					alert('得到结果' + result);
					console.log(result);
				},
				error: function (object, error) {
					alert('发生了错误' + error.message);
				}
			});
		},

		register: function () {
			var self = this;
			if (!this.username || !this.password) {
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
				success: function (user) {
					// Hooray! Let them use the app now.
					self.is_login = self.curr_user() ? true : false;
					alert('注册成功!');
				},
				error: function (user, error) {
					// Show the error message somewhere and let the user try again.
					alert("Error: " + error.code + " " + error.message);
				}
			});
		},

		login: function () {
			var self = this;
			if (!this.username || !this.password) {
				alert('用户名、密码必须输入！');
				return;
			}
			Bmob.User.logIn(this.username, this.password, {
				success: function (user) {
					// Do stuff after successful login.
					self.is_login = self.curr_user() ? true : false;
					alert('登录成功');
				},
				error: function (user, error) {
					// The login failed. Check error to see why.
					alert('登录失败' + error.message);
				}
			});
		},

		verify_email: function () {
			//reset password
			Bmob.User.requestEmailVerify("h6k65@126.com", {
				success: function () {
					// Password reset request was sent successfully
					alert('验证邮件发送成功！');
				},
				error: function (error) {
					// Show the error message somewhere
					alert("Error: " + error.code + " " + error.message);
				}
			});
		},

		reset_pwd: function () {
			Bmob.User.requestPasswordReset("test@126.com", {
				success: function () {
					// Password reset request was sent successfully
					alert('密码重置成功！');
				},
				error: function (error) {
					// Show the error message somewhere
					alert("Error: " + error.code + " " + error.message);
				}
			});
		},

		curr_user: function () {
			var currentUser = Bmob.User.current();
			if (currentUser) {
				// do stuff with the user
			} else {
				// show the signup or login page
			}
			return currentUser;
		},

		logout: function () {
			var self = this;
			Bmob.User.logOut();
			var currentUser = Bmob.User.current();  // this will now be null
			self.is_login = self.curr_user() ? true : false;
		},

		blank: function (v) {
			return '___';
		},

		myfmt: function (o) {
			return (o + '').replace('*', '×').replace('/', '÷').replace('+', '＋').replace('-', '－');
		}

	}
});

