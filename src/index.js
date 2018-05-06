import React, { Component } from 'react'
import { render } from 'react-dom'
import _ from 'lodash'
import injectSheet from 'react-jss'

const mData = {
  iu: 'q',
  ei: 'w',
  uan: 'r',
  ue: 't',
  un: 'y',
  sh: 'u',
  ch: 'i',
  uo: 'o',
  ie: 'p',
  ong: 's',
  iong: 's',
  ai: 'd',
  en: 'f',
  eng: 'g',
  ang: 'h',
  an: 'j',
  uai: 'k',
  ing: 'k',
  iang: 'l',
  uang: 'l',
  ou: 'z',
  ia: 'x',
  ua: 'x',
  ao: 'c',
  zh: 'v',
  ui: 'v',
  in: 'b',
  iao: 'n',
  ian: 'm'
}

const yData = {
  q: '秋',
  w: '味',
  e: '鹅',
  r: '卵',
  t: '悦',
  y: '匀',
  u: '熟',
  i: '吃',
  o: '破',
  p: '撇',
  a: '啊',
  s: '松熊',
  d: '逮',
  f: '奋',
  g: '更',
  h: '行',
  j: '砍',
  k: '快拎',
  l: '两筐',
  z: '走',
  x: '瞎抓',
  c: '草',
  v: '追女',
  b: '宾',
  n: '鸟',
  m: '面'
}

const styles = {
  root: {
    textAlign: 'center'
  },
  logo: {
    position: 'absolute',
    top: 8,
    right: 8,

    '& img': {
      width: 30,
      height: 30
    }
  },
  table: {
    margin: '20px auto'
  },
  input: {
    border: '1px solid #ddd'
  },
  button: {
    margin: '4px 10px',
    border: '1px solid #ddd'
  },
  order: {
    display: 'inline-block',
    margin: '0 3px 2px',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #ddd',

    '&.recover': {
      margin: '0 3px',
      borderLeft: '6px solid #ddd',
      borderRight: '6px solid #ddd',
      borderBottom: '6px solid #ddd'
    }
  }
}

const FLYPYKEY = 'flypyStore'

let inter = null

function filterNumber(num, fixed) {
  return Number.isInteger(num) ? num + '.' + '0'.repeat(fixed) : num.toFixed(fixed)
}

class App extends Component {
  inputRef = React.createRef()
  state = {
    startTime: null,
    lastTime: null,
    keyItr: null,
    subjectText: '',
    hintText: '',
    useTime: 0,
    correctNum: 0,
    GameProcessNum: 0,
    totalNum: 0,
    answers: [],
    inputValue: '',
    isPlay: false,
    isOrderByFailNum: false,
    isOrderByTotalTime: false
  }

  speedList = []
  answersBackUpList = []
  orderByFailNumList = []
  orderByTotalTimeList = []

  historyStore = null

  onChange = e => {
    if (!this.state.isPlay) return

    const value = e.target.value
    let isFail = true

    if (value === mData[this.state.subjectText]) {
      this.setState({
        correctNum: this.state.correctNum + 1
      })
      isFail = false
    }

    const nextItem = this.state.keyItr.next()

    const duration = Number.parseFloat(((new Date().getTime() - (this.state.lastTime || this.state.startTime)) / 1000).toFixed(1))
    if (this.speedList.length < 3) {
      this.speedList = this.speedList.concat([duration]).sort()
    } else {
      if (duration > this.speedList[0]) {
        this.speedList = this.speedList
          .slice(1)
          .concat([duration])
          .sort()
      }
    }
    const subject = this.state.subjectText
    const lastFailNum = this.historyStore && this.historyStore[subject] ? this.historyStore[subject].failNum : 0
    let newAnswers = [
      {
        id: Number(
          Math.random()
            .toString()
            .substr(3, 5) + Date.now()
        ).toString(36),
        subject: subject,
        answer: mData[subject],
        myAnswer: value,
        isFail: isFail,
        isSlow: false,
        hint: yData[mData[subject]],
        duration: duration,
        historyDuration: (this.historyStore && this.historyStore[subject] ? this.historyStore[subject].duration : 0) + duration,
        historyFailNum: isFail ? lastFailNum + 1 : lastFailNum
      }
    ].concat(this.state.answers)

    if (nextItem.done) {
      clearInterval(inter)
      newAnswers = newAnswers.map(item => {
        return {
          ...item,
          isSlow: item.duration >= this.speedList[0]
        }
      })
      setTimeout(() => {
        this.answersBackUpList = newAnswers.slice()
        this.orderByTotalTimeList = newAnswers.slice().sort((a, b) => {
          if (a.historyDuration > b.historyDuration) {
            return -1
          }
          if (a.historyDuration < b.historyDuration) {
            return 1
          }
          return 0
        })
        this.orderByFailNumList = newAnswers.slice().sort((a, b) => {
          if (a.historyFailNum > b.historyFailNum) {
            return -1
          }
          if (a.historyFailNum < b.historyFailNum) {
            return 1
          }
          return 0
        })

        const flypyStore = {}
        newAnswers.forEach(item => {
          const sObj = {
            duration: item.historyDuration,
            failNum: item.historyFailNum
          }
          flypyStore[item.subject] = sObj
        })
        localStorage.setItem(FLYPYKEY, JSON.stringify(flypyStore))
      }, 0)
    }

    this.setState({
      subjectText: nextItem.value,
      lastTime: new Date().getTime(),
      GameProcessNum: this.state.GameProcessNum + 1,
      isPlay: !nextItem.done,
      answers: newAnswers,
      hintText: ''
    })
  }

  startGame = () => {
    this.historyStore = JSON.parse(localStorage.getItem(FLYPYKEY))
    const list = _.shuffle(_.keys(mData))
    const itr = list[Symbol.iterator]()
    const timeStemp = new Date().getTime()
    this.setState({
      startTime: timeStemp,
      lastTime: null,
      keyItr: itr,
      subjectText: itr.next().value,
      hintText: '',
      useTime: 0,
      correctNum: 0,
      GameProcessNum: 0,
      totalNum: list.length,
      answers: [],
      isPlay: true
    })

    this.speedList = []
    this.answersBackUpList = []
    this.orderByFailNumList = []
    this.orderByTotalTimeList = []

    inter = setInterval(() => {
      this.setState({
        useTime: ((new Date().getTime() - this.state.startTime) / 1000).toFixed(1)
      })
    }, 10)
    this.inputRef.current.focus()
  }

  stopGame = () => {
    clearInterval(inter)
    this.setState({
      isPlay: false
    })
  }

  showHint = () => {
    this.setState({
      hintText: yData[mData[this.state.subjectText]]
    })
    this.inputRef.current.focus()
  }

  clearStore = () => {
    localStorage.removeItem(FLYPYKEY)
  }

  onOrderByFailNum = () => {
    if (this.orderByFailNumList.length < 1) return
    this.setState({
      isOrderByFailNum: !this.state.isOrderByFailNum,
      isOrderByTotalTime: false,
      answers: !this.state.isOrderByFailNum ? this.orderByFailNumList : this.answersBackUpList
    })
  }
  onOrderByTotalTime = () => {
    if (this.orderByTotalTimeList.length < 1) return
    this.setState({
      isOrderByTotalTime: !this.state.isOrderByTotalTime,
      isOrderByFailNum: false,
      answers: !this.state.isOrderByTotalTime ? this.orderByTotalTimeList : this.answersBackUpList
    })
  }

  render() {
    const { classes } = this.props
    const { subjectText, hintText, useTime, correctNum, GameProcessNum, inputValue, totalNum, answers, isPlay, isOrderByFailNum, isOrderByTotalTime } = this.state
    return (
      <div className={classes.root}>
        <a className={classes.logo} href="https://github.com/bulatie/flypy-practice">
          <img src="/github.png" alt="repository" />
        </a>
        <p>题： {subjectText}</p>
        <input className={classes.input} value={inputValue} onChange={this.onChange} ref={this.inputRef} />
        <p>{hintText}</p>
        <p>用时: {useTime}s</p>
        <p>正确率: {totalNum ? (correctNum / totalNum * 100).toFixed(2) : 0}%</p>
        <p>
          进度: {GameProcessNum} / {totalNum}
        </p>
        <button className={classes.button} onClick={this.startGame} disabled={isPlay}>
          开始
        </button>
        <button className={classes.button} onClick={this.stopGame} disabled={!isPlay}>
          停止
        </button>
        <button className={classes.button} onClick={this.showHint} disabled={!isPlay}>
          提示
        </button>
        <button className={classes.button} onClick={this.clearStore} disabled={isPlay}>
          清空历史
        </button>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>题</th>
              <th>答案</th>
              <th>回答</th>
              <th>用时</th>
              <th>提示</th>
              <th onClick={this.onOrderByFailNum}>
                错过<span className={classes.order + (isOrderByFailNum ? ' recover' : '')} />
              </th>
              <th onClick={this.onOrderByTotalTime}>
                总时<span className={classes.order + (isOrderByTotalTime ? ' recover' : '')} />
              </th>
            </tr>
          </thead>
          <tbody>
            {answers.map(item => {
              return (
                <tr key={item.id} style={{ color: item.isFail ? 'red' : item.isSlow ? 'purple' : 'green' }}>
                  <td>{item.subject}</td>
                  <td>{item.answer}</td>
                  <td>{item.myAnswer}</td>
                  <td>{filterNumber(item.duration, 1)}</td>
                  <td>{item.hint}</td>
                  <td>{item.historyFailNum}</td>
                  <td>{filterNumber(item.historyDuration, 1)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

const StyleApp = injectSheet(styles)(App)
render(<StyleApp />, document.getElementById('root'))
