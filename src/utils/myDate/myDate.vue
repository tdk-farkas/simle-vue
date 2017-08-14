<!--/**
* Created by Farkas on 2017/4/26.
*  版本 v1.0.2
*
*  新版增加功能：
*  v1.0.2 新增  年份修改 与  年份修改开关 ， 样式优化
*
*
* 需要外部传入的参数:
* 1. @check-item  当可点击项被选中时，会通过这个事件通知外部  并且会传递一个参数  item   里面包含字段   年 year   月 month  日 day    对应的库存对象 stock  可能为null 需要自行判断
* 2. :stock-list  库存列表， 每项必须包含字段   价格  price     数量  count     显示库存的日期  dateInfo
* 3. :date  时间对象，用于提示组件显示哪个月
* 4. :not-stock-check  没有库存的日期是否可选中， 默认 false  如果允许选中没有库存的日期 就给 true
* 5. @update-stock  更新库存的function ， 当 组件内部 date 对象发生变化时，会调用该事件 并把 当前 date 对象传递出来
* 6. :max-date  日历最大时间    默认为 date 一年后   最大日期最小值 暂不支持 外部修改
* 7. :min-date  日历最小时间    默认为 date 当天      最大日期最小值 暂不支持 外部修改
* 8. :title        左上角标题  默认   日期选择
* 9. :change-year   是否允许改变 年份 默认  false   不允许改变
*/-->

<template>
    <div id="myDate">
        <div class="fill-order-title">
            <div class="title-left">
                <div class="s-line"></div>
                <div class="select-date">{{titleTxt}}</div>
            </div>
            <div class="month-choice">
                <div class="year-div">
                    <div v-if="changeY" :class="{'icon-check':lastY,'icon-white':!lastY}" @click="lastYear"></div>
                    <div class="year">{{showDate.getFullYear()}}</div>
                    <div v-if="changeY" class="icon-right" :class="{'icon-check':nextY,'icon-white':!nextY}"
                         @click="nextYear"></div>
                </div>
                <div class="month-div">
                    <div :class="{'icon-check':lastM,'icon-white':!lastM}" @click="lastMonth"></div>
                    <label class="month">{{(showDate.getMonth() + 1) > 9 ? (showDate.getMonth() + 1) : '0' + (showDate.getMonth() + 1)}}月</label>
                    <div class="icon-right" :class="{'icon-check':nextM,'icon-white':!nextM}" @click="nextMonth"></div>
                </div>
            </div>
        </div>
        <table class="date-check" cellpadding="0" cellspacing="0">
            <tr>
                <th>日</th>
                <th>一</th>
                <th>二</th>
                <th>三</th>
                <th>四</th>
                <th>五</th>
                <th>六</th>
            </tr>
            <tr v-for="(cols,idx1) in rows">
                <!-- v-if="item.day"      当前日期是否有效-->
                <template v-for="(item,idx2) in cols" v-if="item.day">
                    <!--v-if="countNowDate(item)&&countStockAndPrice(item)"  第一个函数判断需要显示的日期是否大于当前日期，第二个函数判断需要显示的日期是否有对应的库存信息-->
                    <template v-if="countNowDate(item)&&countStockAndPrice(item)">
                        <!--'date-noe-choice':checkDay!=item    没有被选中时，展示这个样式
                                date-choice':checkDay==item  选中时，展示这个样式-->
                        <td :class="{'date-noe-choice':checkDay!=item,'date-choice':checkDay==item}"
                            @click="checkItem(idx1,idx2)">
                            <span class="date-price"
                                  :class="{'date-span':checkDay==item}">{{item.stock.price.length > 6 ? Number(item.stock.price) : '¥' + item.stock.price}}</span>
                            <span :class="{'date-date':checkDay==item}">{{item.day}}</span>
                            <span class="date-price" :class="{'date-span':checkDay==item}">余{{item.stock.count}}</span>
                        </td>
                    </template>
                    <!--需要显示的日期不大于当前日期或者需要显示的日期没有对应库存信息时展示以下内容-->
                    <template v-else>
                        <!--'date-noData':!notStockCheck  没有库存并且不可选中时，展示这个样式
                                date-noe-choice':notStockCheck&&checkDay!=item    没有库存但是允许选中时，展示这个样式
                                date-choice':checkDay==item  没有库存但允许选中并且已经选中时，展示这个样式-->
                        <td :class="{'date-noData':!notStockCheck,'date-noe-choice':notStockCheck&&checkDay!=item,'date-choice':checkDay==item}"
                            @click="notStockCheck?checkItem(idx1,idx2):''">{{item.day}}
                        </td>
                    </template>
                </template>
                <!--无效的日期就只添加一个 td-->
                <template v-else>
                    <td></td>
                </template>
            </tr>
        </table>
    </div>
</template>
<script>
    export default{
        name: 'myDate',
        props: {
            //库存列表， 包含字段    price     count     dateInfo
            stockList: {
                type: Array
            },
            //没有库存的日期是否可以选中
            notStockCheck: {
                type: Boolean
            },
            //需要显示的日期，会自动把 date 调整到 当月第一天
            date: {
                type: Date
            },
            //最大日期
            maxDate: {
                type: Date
            },
            //最小日期
            minDate: {
                type: Date
            },
            //标题
            title: {
                type: String
            },
            //修改年份
            changeYear: {
                type: Boolean
            }
        },
        data () {
            let data = {
                'rows': [],
                'checkDay': null
            };

            if (!this.title) {
                data.titleTxt = '选择日期'
            } else {
                data.titleTxt = this.title
            }

            if (!this.date) {
                data.showDate = new Date();
            } else {
                data.showDate = this.date;
            }

            data.showDate.setDate(1);
            data.showDate.setHours(0, 0, 0, 0);

            if (!this.maxDate) {
                data.maxD = new Date(data.showDate.getTime());
                data.maxD.setYear(data.maxD.getFullYear() + 1);
                data.maxD.setDate(1);
            } else {
                this.maxDate.setHours(0, 0, 0, 0);
                data.maxD = this.maxDate;
            }

            if (!this.minDate) {
                data.minD = new Date(data.showDate.getTime());
                data.minD.setMonth(data.minD.getMonth() + 1);
                data.minD.setDate(0);
            } else {
                this.minDate.setHours(0, 0, 0, 0);
                data.minD = this.minDate;
            }

            data.changeY = this.changeYear;

            this.countLastAndNext(data.showDate, data.maxD, data.minD, data.changeY);

            let views = this.updateView(data.showDate);
            data.rows = views.rows;
            data.checkDay = views.checkDay;

            return data
        },
        methods: {
            //初始化 出行日期的 月份修改按钮
            'countLastAndNext' (date, maxDate, minDate, changeY) {
                //库存时间必须小于于这个时间才能允许点击下一页
                // this.nextM = this.date.getTime() < this.maxDate.getTime();
                this.nextM = date.getTime() < maxDate.getTime();
                //库存时间必须大于这个时间才能允许点击上一页
                // this.lastM = this.date.getTime() > this.minDate.getTime();
                this.lastM = date.getTime() > minDate.getTime();

                this.lastY = changeY ? date.getFullYear() > minDate.getFullYear() : false;
                this.nextY = changeY ? date.getFullYear() < maxDate.getFullYear() : false;
            },
            'lastYear' () {
                if (this.lastY) {
                    this.showDate.setYear(this.showDate.getFullYear() - 1);
                    let stockDate = new Date(this.showDate.getTime());

                    this.lastY = stockDate.getFullYear() > this.minD.getFullYear();
                    this.nextY = true;

                    if (stockDate.getTime() <= this.minD.getTime()) {
                        stockDate.setTime(this.minD.getTime());
                    }

                    this.showDate = stockDate;
                }
            },
            'nextYear' () {
                if (this.nextY) {
                    this.showDate.setYear(this.showDate.getFullYear() + 1);
                    let stockDate = new Date(this.showDate.getTime());

                    this.nextY = stockDate.getFullYear() < this.maxD.getFullYear();
                    this.lastY = true;

                    if (stockDate.getTime() > this.maxD.getTime()) {
                        stockDate.setTime(this.maxD.getTime());
                    }

                    this.showDate = stockDate;
                }
            },
            //上一个月
            'lastMonth' () {
                if (this.lastM) {
                    this.showDate.setMonth(this.showDate.getMonth() - 1);
                    let stockDate = new Date(this.showDate.getTime());

                    this.lastM = stockDate.getTime() > this.minD.getTime();
                    this.nextM = true;

                    this.showDate = stockDate;
                }
            },
            //下一个月
            'nextMonth' () {
                if (this.nextM) {
                    this.showDate.setMonth(this.showDate.getMonth() + 1);
                    let stockDate = new Date(this.showDate.getTime());

                    this.nextM = stockDate.getTime() < this.maxD.getTime();
                    this.lastM = true;

                    this.showDate = stockDate;
                }
            },
            //当可点击项被点击时
            'checkItem' (idx1, idx2) {
                let item = this.rows[idx1][idx2];
                if (this.notStockCheck || item.stock) {
                    this.checkDay = item;
                }
            },
            //计算库存展示的内容
            'countStockAndPrice' (item) {
                if (this.stockList) {
                    for (let i = 0; i < this.stockList.length; i++) {
                        let stock = this.stockList[i];
                        let dateInfo = new Date(stock.dateInfo);
                        if (dateInfo.getFullYear() === item.year && dateInfo.getMonth() === item.month && dateInfo.getDate() === item.day) {
                            item.stock = stock;
                            break
                        }
                    }
                }

                return item.stock;
            },
            //计算显示日期是否大于当前日期，大于就可以展示库存
            'countNowDate' (item) {
                let now = new Date();
                now.setHours(0, 0, 0, 0);
                let itemDate = new Date(item.year, item.month, item.day);
                return itemDate.getTime() >= now.getTime();
            },
            //刷新整个组件
            'updateView' (date) {
                let now = new Date(date);
                //当月第一天周几
                now.setDate(1);
                let firstDay = now.getDay();
                //当月有多少天
                now.setMonth(now.getMonth() + 1);
                now.setDate(0);
                let dayCount = now.getDate();

                let rows = [];
                let cols = [];

                //将第一天之前的位置补满
                for (let j = 0; j < 7; j++) {
                    if (j === firstDay) {
                        break;
                    } else {
                        cols[cols.length] = {
                            year: 0,
                            month: 0,
                            day: ''
                        };
                    }
                }

                for (let day = 1; day <= dayCount; day++) {
                    cols[cols.length] = {
                        year: now.getFullYear(),
                        month: now.getMonth(),
                        day: day
                    };

                    //最后一天后的位置补满
                    if (day === dayCount) {
                        now.setDate(day);
                        for (let k = now.getDay() + 1; k < 7; k++) {
                            cols[cols.length] = {
                                year: 0,
                                month: 0,
                                day: ''
                            };
                        }
                    }

                    if (cols.length === 7) {
                        rows[rows.length] = cols.slice();
                        cols = [];
                    }
                }

                this.rows = rows;
                this.checkDay = null;

                return {
                    rows: this.rows,
                    checkDay: this.checkDay
                }
            }
        },
        watch: {
            'changeYear' (newValue) {
                this.changeY = newValue;
                this.countLastAndNext(this.showDate, this.maxD, this.minD, newValue);
            },
            'date' (newValue) {
                this.showDate = newValue;
            },
            'minDate' (newValue) {
                this.minD = newValue;
            },
            'maxDate' (newValue) {
                this.maxD = newValue;
            },
            'minD' () {
                this.countLastAndNext(this.showDate, this.maxD, this.minD, this.changeY);
            },
            'maxD' () {
                this.countLastAndNext(this.showDate, this.maxD, this.minD, this.changeY);
            },
            'showDate' () {
                this.countLastAndNext(this.showDate, this.maxD, this.minD, this.changeY);
                //当库存列表不存在时直接更新视图
                this.updateView(this.showDate);

                //更新库存的函数，需要外部传入，每当 组件内date切换时 就会调用该函数通知外部更新库存   提示外部更新时会附带 date 对象
                this.$emit('update-stock', this.showDate);
            },
            'checkDay' (newObj) {
                this.$emit('check-item', newObj);
            },
            //每当库存列表发生改变时刷新组件
            'stockList' () {
                this.updateView(this.showDate);
            }
        }
    }
</script>

<style lang="less" src="./myDate.less"></style>