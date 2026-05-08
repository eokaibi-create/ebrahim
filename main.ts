/**
 * 🏆 micro:bit V2 超级计步器
 * ===========================
 * 按钮 A  → 环境数据（温度+光线+声音）
 * 按钮 B  → 全部运动数据（7页轮播）
 * A+B     → 指南针方向（8方向）
 * Logo触摸 → 切换实时显示模式（进度条/步数/卡路里/配速）
 * 拍手    → 声控快照记录
 * 摇晃    → 重置新的一天
 */

// ========================================
// 1️⃣ 变量声明
// ========================================
let Steps = 0
let StartTime = 0
let LastStep = 0
let LastMinute = 0
let StepPerMin = 0
let Pace = 0
let Goal = 100
let Tracking = false
let Weight = 60
let Height = 170
let Stride = 0
let TotalCal = 0
let MaxPace = 0
let ShowMode = 0
let DayCounter = 1
let Temp = 0
let accel = 0
let met = 3.5
let hours = 0
let d = 0
let mins = 0
let totalMin = 0
let calPerMin = 0
let heading = 0
let calRounded = 0
let soundLevel = 0
let snapTime = 0

// ========================================
// 2️⃣ 开机初始化
// ========================================
StartTime = input.runningTime()
LastMinute = input.runningTime()
Stride = Height * 0.415
Tracking = true
basic.showString("GO!")
input.calibrateCompass()
basic.pause(500)
basic.clearScreen()

// ========================================
// 3️⃣ 主循环：步数检测 + 实时显示
// ========================================
basic.forever(function () {
    if (Tracking) {
        // ----- 步数检测 -----
        accel = input.acceleration(Dimension.Strength)
        if (accel > 1900) {
            if (input.runningTime() - LastStep > 450) {
                Steps += 1
                StepPerMin += 1
                LastStep = input.runningTime()
                led.plot(2, 2)
                basic.pause(30)
                led.unplot(2, 2)
            }
        }
        
        // ----- 每分钟算配速 -----
        if (input.runningTime() - LastMinute > 60000) {
            Pace = StepPerMin
            if (Pace > MaxPace) {
                MaxPace = Pace
            }
            StepPerMin = 0
            LastMinute = input.runningTime()
        }
        
        // ----- 卡路里计算（MET公式） -----
        hours = (input.runningTime() - StartTime) / 3600000
        if (hours < 0.02) {
            hours = 0.02
        }
        if (Pace < 60) {
            met = 2.5
        } else if (Pace < 100) {
            met = 3.5
        } else if (Pace < 130) {
            met = 5.0
        } else {
            met = 8.0
        }
        calPerMin = met * Weight * 3.5 / 200
        totalMin = hours * 60
        TotalCal = calPerMin * totalMin
        calRounded = Math.round(TotalCal * 10) / 10
        
        // ----- 显示模式切换 -----
        if (ShowMode == 0) {
            // 目标进度条
            for (let row = 0; row < 5; row++) {
                if (Steps > Goal / 5 * (row + 1)) {
                    for (let col = 0; col < 5; col++) {
                        led.plot(col, row)
                    }
                } else {
                    for (let col = 0; col < 5; col++) {
                        led.unplot(col, row)
                    }
                }
            }
        } else if (ShowMode == 1) {
            basic.showNumber(Steps)
            basic.pause(200)
        } else if (ShowMode == 2) {
            basic.showNumber(calRounded)
            basic.pause(200)
        } else if (ShowMode == 3) {
            basic.showNumber(Pace)
            basic.pause(200)
        }
    }
    basic.pause(50)
})

// ========================================
// 4️⃣ Logo触摸：切换显示模式
// ========================================
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    ShowMode += 1
    if (ShowMode > 3) {
        ShowMode = 0
    }
    basic.clearScreen()
    basic.showString("M")
    basic.showNumber(ShowMode)
    basic.pause(300)
    basic.clearScreen()
})

// ========================================
// 5️⃣ 按钮A：环境数据
// ========================================
input.onButtonPressed(Button.A, function () {
    basic.clearScreen()
    
    // 温度
    basic.showString("TEMP")
    Temp = input.temperature()
    basic.showNumber(Temp)
    basic.showString("C")
    basic.pause(1000)
    basic.clearScreen()
    
    // 光线
    basic.showString("LIGHT")
    basic.showNumber(input.lightLevel())
    basic.pause(1000)
    basic.clearScreen()
    
    // 声音
    basic.showString("NOISE")
    soundLevel = input.soundLevel()
    basic.showNumber(soundLevel)
    if (soundLevel > 150) {
        basic.showString("LOUD")
    } else if (soundLevel > 80) {
        basic.showString("MID")
    } else {
        basic.showString("QUIET")
    }
    basic.pause(1500)
    basic.clearScreen()
})

// ========================================
// 6️⃣ 按钮B：全部运动数据（7页）
// ========================================
input.onButtonPressed(Button.B, function () {
    Tracking = false
    basic.clearScreen()
    
    // 第1页：步数
    basic.showString("S")
    basic.showNumber(Steps)
    basic.pause(1500)
    basic.clearScreen()
    
    // 第2页：距离
    basic.showString("D")
    d = Math.round(Steps * Stride / 100 * 100) / 100
    basic.showNumber(d)
    basic.showString("m")
    basic.pause(1500)
    basic.clearScreen()
    
    // 第3页：卡路里
    basic.showString("C")
    if (Pace < 60) {
        met = 2.5
    } else if (Pace < 100) {
        met = 3.5
    } else if (Pace < 130) {
        met = 5.0
    } else {
        met = 8.0
    }
    hours = (input.runningTime() - StartTime) / 3600000
    if (hours < 0.02) {
        hours = 0.02
    }
    calPerMin = met * Weight * 3.5 / 200
    totalMin = hours * 60
    TotalCal = calPerMin * totalMin
    calRounded = Math.round(TotalCal * 10) / 10
    basic.showNumber(calRounded)
    basic.showString("k")
    basic.pause(1500)
    basic.clearScreen()
    
    // 第4页：时间
    basic.showString("T")
    mins = Math.round((input.runningTime() - StartTime) / 60000)
    basic.showNumber(mins)
    basic.showString("m")
    basic.pause(1500)
    basic.clearScreen()
    
    // 第5页：最高配速
    basic.showString("P")
    basic.showNumber(MaxPace)
    basic.showString("/m")
    basic.pause(1500)
    basic.clearScreen()
    
    // 第6页：运动等级
    basic.showString("LV")
    if (Pace < 60) {
        basic.showString("LOW")
    } else if (Pace < 100) {
        basic.showString("MID")
    } else if (Pace < 130) {
        basic.showString("HGH")
    } else {
        basic.showString("RUN")
    }
    basic.pause(1500)
    basic.clearScreen()
    
    // 第7页：身体数据
    basic.showString("KG")
    basic.showNumber(Weight)
    basic.pause(1000)
    basic.showString("CM")
    basic.showNumber(Height)
    basic.pause(1500)
    basic.clearScreen()
    
    // 数据日志
    datalogger.log(datalogger.createCV("steps", Steps))
    datalogger.log(datalogger.createCV("dist_m", d))
    datalogger.log(datalogger.createCV("cal_kcal", calRounded))
    datalogger.log(datalogger.createCV("time_min", mins))
    datalogger.log(datalogger.createCV("pace", Pace))
    datalogger.log(datalogger.createCV("day", DayCounter))
    
    basic.showString("A=go")
    Tracking = true
})

// ========================================
// 7️⃣ A+B：指南针方向
// ========================================
input.onButtonPressed(Button.AB, function () {
    Tracking = false
    basic.clearScreen()
    basic.showString("DIR")
    
    heading = input.compassHeading()
    
    if (heading < 22.5 || heading >= 337.5) {
        led.plot(2, 0)
        led.plot(2, 1)
        led.plot(2, 2)
        led.plot(1, 1)
        led.plot(3, 1)
        basic.showString("N")
    } else if (heading < 67.5) {
        basic.showString("NE")
    } else if (heading < 112.5) {
        led.plot(4, 2)
        led.plot(3, 2)
        led.plot(2, 2)
        led.plot(3, 1)
        led.plot(3, 3)
        basic.showString("E")
    } else if (heading < 157.5) {
        basic.showString("SE")
    } else if (heading < 202.5) {
        led.plot(2, 4)
        led.plot(2, 3)
        led.plot(2, 2)
        led.plot(1, 3)
        led.plot(3, 3)
        basic.showString("S")
    } else if (heading < 247.5) {
        basic.showString("SW")
    } else if (heading < 292.5) {
        led.plot(0, 2)
        led.plot(1, 2)
        led.plot(2, 2)
        led.plot(1, 1)
        led.plot(1, 3)
        basic.showString("W")
    } else {
        basic.showString("NW")
    }
    
    basic.showNumber(Math.round(heading))
    basic.showString("d")
    basic.pause(2000)
    basic.clearScreen()
    Tracking = true
})

// ========================================
// 8️⃣ 拍手声控快照
// ========================================
input.onLoudSound(function () {
    if (Tracking) {
        Tracking = false
        basic.clearScreen()
        basic.showString("SNAP")
        basic.pause(300)
        
        basic.showNumber(Steps)
        basic.pause(1000)
        basic.clearScreen()
        basic.showNumber(calRounded)
        basic.pause(1000)
        basic.clearScreen()
        
        snapTime = Math.round((input.runningTime() - StartTime) / 60000)
        datalogger.log(datalogger.createCV("snap_steps", Steps))
        datalogger.log(datalogger.createCV("snap_cal", calRounded))
        datalogger.log(datalogger.createCV("snap_time", snapTime))
        
        basic.showString("OK")
        basic.pause(500)
        basic.clearScreen()
        Tracking = true
    }
})

// ========================================
// 9️⃣ 摇晃重置新的一天
// ========================================
input.onGesture(Gesture.Shake, function () {
    if (input.runningTime() - LastStep > 5000) {
        basic.clearScreen()
        basic.showString("RST")
        basic.pause(1000)
        basic.clearScreen()
        
        datalogger.log(datalogger.createCV("day_end", DayCounter))
        datalogger.log(datalogger.createCV("max_pace", MaxPace))
        
        Steps = 0
        TotalCal = 0
        MaxPace = 0
        StartTime = input.runningTime()
        LastMinute = input.runningTime()
        StepPerMin = 0
        DayCounter += 1
        
        basic.showString("D")
        basic.showNumber(DayCounter)
        basic.pause(1000)
        basic.clearScreen()
    }
})

// ========================================
// 🔟 设置麦克风灵敏度
// ========================================
input.setLoudSoundThreshold(128)
