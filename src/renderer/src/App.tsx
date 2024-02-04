import { useState } from 'react'

type Time = {
  hours: number
  minutes: number
}

function App(): JSX.Element {
  const [time, setTime] = useState<Time>({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes()
  })
  const setHour = (inputHour: number): void => {
    const hours = 0 <= inputHour && inputHour <= 23 ? inputHour : 0
    setTime({
      ...time,
      hours
    })
  }
  const setMinutes = (inputMinutes: number): void => {
    const minutes = 0 <= inputMinutes && inputMinutes <= 59 ? inputMinutes : 0
    setTime({
      ...time,
      minutes
    })
  }

  const onClick = (): void => {
    window.electron.ipcRenderer.invoke('setTimer', time)
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: '0.25rem'
        }}
      >
        <input
          style={{ width: '2.5rem' }}
          value={time.hours}
          type="number"
          onChange={(e) => setHour(Number(e.target.value))}
        />
        <span>時</span>
        <input
          style={{ width: '2.5rem' }}
          value={time.minutes}
          type="number"
          onChange={(e) => setMinutes(Number(e.target.value))}
        />
        <span>分</span>
        <button style={{ margin: '0 0.25rem' }} onClick={onClick}>
          に通知する
        </button>
      </div>
    </>
  )
}

export default App
