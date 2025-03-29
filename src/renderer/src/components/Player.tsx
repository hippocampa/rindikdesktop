import { Component, createSignal, onMount, onCleanup, For } from 'solid-js'
import ding_low from '../assets/tones/ding_low.mp3'
import dong_low from '../assets/tones/dong_low.mp3'
import deng_low from '../assets/tones/deng_low.mp3'
import dung_low from '../assets/tones/dung_low.mp3'
import dang_low from '../assets/tones/dang_low.mp3'
import ding_med from '../assets/tones/ding_med.mp3'
import dong_med from '../assets/tones/dong_med.mp3'
import deng_med from '../assets/tones/deng_med.mp3'
import dung_med from '../assets/tones/dung_med.mp3'
import dang_med from '../assets/tones/dang_med.mp3'
import ding_high from '../assets/tones/ding_high.mp3'

interface BambooKeys {
  id: number
  tone: string
  octave: string
  keyshortcut: string
}

async function loadAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return context.decodeAudioData(arrayBuffer)
}

const Player: Component = () => {
  const [bambooKeys] = createSignal<BambooKeys[]>([
    { id: 1, tone: 'ding', octave: 'low', keyshortcut: 'a' },
    { id: 2, tone: 'dong', octave: 'low', keyshortcut: 's' },
    { id: 3, tone: 'deng', octave: 'low', keyshortcut: 'd' },
    { id: 4, tone: 'dung', octave: 'low', keyshortcut: 'f' },
    { id: 5, tone: 'dang', octave: 'low', keyshortcut: 'g' },
    { id: 6, tone: 'ding', octave: 'med', keyshortcut: 'h' },
    { id: 7, tone: 'dong', octave: 'med', keyshortcut: 'j' },
    { id: 8, tone: 'deng', octave: 'med', keyshortcut: 'k' },
    { id: 9, tone: 'dung', octave: 'med', keyshortcut: 'l' },
    { id: 10, tone: 'dang', octave: 'med', keyshortcut: ';' },
    { id: 11, tone: 'ding', octave: 'high', keyshortcut: "'" }
  ])

  const audiolist = [
    ding_low,
    dong_low,
    deng_low,
    dung_low,
    dang_low,
    ding_med,
    dong_med,
    deng_med,
    dung_med,
    dang_med,
    ding_high
  ]

  const [audioBuffers, setAudioBuffers] = createSignal<AudioBuffer[]>([])
  const [activeKeys, setActiveKeys] = createSignal<Set<number>>(new Set())

  let audioCtx: AudioContext | null = null

  onMount(async () => {
    audioCtx = new AudioContext()

    const buffers: AudioBuffer[] = []
    for (let i = 0; i < audiolist.length; i++) {
      const buffer = await loadAudioBuffer(audioCtx, audiolist[i] as string)
      buffers.push(buffer)
    }
    setAudioBuffers(buffers)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  const playSound = (id: number): void => {
    if (!audioCtx) return
    const buffer = audioBuffers()[id - 1]
    if (!buffer) return

    const source = audioCtx.createBufferSource()
    source.buffer = buffer

    const gainNode = audioCtx.createGain()
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime) // mulai volume penuh

    source.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    source.start(0)

    const duration = buffer.duration
    const fadeTime = 0.2

    if (duration > fadeTime) {
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration)
    }

    source.stop(audioCtx.currentTime + duration)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = bambooKeys().find((k) => k.keyshortcut === e.key)
    if (key && !activeKeys().has(key.id)) {
      setActiveKeys((prev) => new Set(prev).add(key.id))
      playSound(key.id)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    const key = bambooKeys().find((k) => k.keyshortcut === e.key)
    if (key) {
      setActiveKeys((prev) => {
        const copy = new Set(prev)
        copy.delete(key.id)
        return copy
      })
    }
  }

  // Klik bilah
  const handleClick = (key: BambooKeys) => {
    setActiveKeys((prev) => new Set(prev).add(key.id))
    playSound(key.id)
    setTimeout(() => {
      setActiveKeys((prev) => {
        const copy = new Set(prev)
        copy.delete(key.id)
        return copy
      })
    }, 100)
  }

  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-amber-300 p-6">
      <h1 class="text-3xl font-bold mb-8 text-amber-800">Balinese Rindik </h1>
      <div class="grid grid-cols-11 gap-3">
        <For each={bambooKeys()}>
          {(key) => (
            <div
              class={`
                h-32 w-16 
                flex flex-col items-center justify-between
                bg-white border border-amber-700 rounded 
                shadow-md hover:bg-amber-200 
                cursor-pointer transition-colors
                py-4
                ${activeKeys().has(key.id) ? 'bg-amber-300 transform scale-95' : ''}
              `}
              onClick={() => handleClick(key)}
            >
              <div class="flex flex-col items-center">
                <span class="font-semibold text-amber-900">{key.tone}</span>
                <span class="text-xs text-amber-600">{key.octave}</span>
              </div>
              <div class="flex items-center justify-center">
                <span class="text-sm bg-amber-100 px-2 py-1 rounded font-mono">
                  {key.keyshortcut}
                </span>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export default Player
