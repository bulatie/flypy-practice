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
  table: {
    margin: '20px auto'
  },
  input: {
    border: '1px solid #ddd'
  },
  button: {
    margin: '4px 10px',
    border: '1px solid #ddd'
  }
}

let inter = null

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
    isPlay: false
  }

  speedList = []

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

    const duration = ((new Date().getTime() - (this.state.lastTime || this.state.startTime)) / 1000).toFixed(1)

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

    let newAnswers = [
      {
        subject: this.state.subjectText,
        answer: mData[this.state.subjectText],
        myAnswer: value,
        isFail: isFail,
        isSlow: false,
        hint: yData[mData[this.state.subjectText]],
        duration: duration
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

  render() {
    const { classes } = this.props
    const { subjectText, hintText, useTime, correctNum, GameProcessNum, inputValue, totalNum, answers, isPlay } = this.state
    return (
      <div className={classes.root}>
        <p>题目： {subjectText}</p>
        <input className={classes.input} value={inputValue} onChange={this.onChange} ref={this.inputRef} />
        <p>{hintText}</p>
        <p>用时: {useTime}s</p>
        <p>正确率: {totalNum ? (correctNum / totalNum * 100).toFixed(2) : 0}</p>
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

        <table className={classes.table}>
          <thead>
            <tr>
              <th>题目</th>
              <th>答案</th>
              <th>回答</th>
              <th>用时</th>
              <th>提示</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((item, index) => {
              return (
                <tr
                  key={index}
                  style={{
                    color: item.isFail ? 'red' : item.isSlow ? 'purple' : 'green'
                  }}
                >
                  <td>{item.subject}</td>
                  <td>{item.answer}</td>
                  <td>{item.myAnswer}</td>
                  <td>{item.duration}</td>
                  <td>{item.hint}</td>
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
