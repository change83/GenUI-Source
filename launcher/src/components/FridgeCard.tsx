import { useState } from 'react'
import { price } from '../booking'
import { fridge, type Substitute } from '../fridge'
import { IconCheck, IconChevronLeft, IconClose } from './Icons'

export type FridgeView = 'check' | 'substitutes' | 'ordered'

function Reply({ text }: { text: string }) {
  return (
    <>
      <strong className="booking-title">{fridge.title}</strong>
      <div className="fridge-reply">
        <img className="fridge-avatar" src={fridge.avatar} alt="" width={60} height={60} />
        <p>{text}</p>
      </div>
    </>
  )
}

function Substitutes({ onBack, onPick }: { onBack: () => void; onPick: (s: Substitute) => void }) {
  const [picked, setPicked] = useState(fridge.substitutes[0].id)
  const choice = fridge.substitutes.find((s) => s.id === picked) ?? fridge.substitutes[0]
  return (
    <>
      <div className="booking-head">
        <button className="booking-back" onClick={onBack} aria-label="Back">
          <IconChevronLeft size={18} />
        </button>
        <div>
          <strong>Substitutes for {fridge.missing.short.toLowerCase()}</strong>
          <span>For tonight's {fridge.dish}</span>
        </div>
      </div>
      <ul className="fridge-subs" role="radiogroup" aria-label="Substitutes">
        {fridge.substitutes.map((s) => (
          <li key={s.id}>
            <button role="radio" aria-checked={s.id === picked} className={s.id === picked ? 'is-on' : ''} onClick={() => setPicked(s.id)}>
              <i aria-hidden />
              <span>
                <strong>{s.name}</strong>
                <small>{s.note}</small>
              </span>
              <em>{s.price ? price(s.price) : 'In fridge'}</em>
            </button>
          </li>
        ))}
      </ul>
      <button className="booking-btn is-primary" onClick={() => onPick(choice)}>
        {choice.price ? `Buy · ${price(choice.price)}` : 'Use what I have'}
      </button>
    </>
  )
}

/** The fridge agent's answer to a cooking question: what's there, what's missing, and a fix. */
export function FridgeCard(props: {
  view: FridgeView
  size: { width: number; height: number }
  onView: (view: FridgeView) => void
  onPick: (s: Substitute) => void
}) {
  const { view } = props
  const { missing } = fridge
  return (
    <div className={`pill-fridge is-${view}`} style={props.size}>
      {view === 'substitutes' ? (
        <Substitutes onBack={() => props.onView('check')} onPick={props.onPick} />
      ) : view === 'ordered' ? (
        <Reply text={`${missing.short} is on its way, arriving by ${missing.eta} today. You'll have everything for ${fridge.dish}.`} />
      ) : (
        <>
          <Reply text={fridge.message} />
          <ul className="fridge-list">
            {fridge.ingredients.map((i) => (
              <li key={i.name} className={i.have ? '' : 'is-missing'}>
                <i aria-hidden>{i.have ? <IconCheck size={12} strokeWidth={2.6} /> : <IconClose size={11} strokeWidth={2.6} />}</i>
                <span>{i.name}</span>
                <em>{i.note}</em>
              </li>
            ))}
          </ul>
          <div className="fridge-product">
            <img src={missing.image} alt="" width={60} height={60} />
            <div>
              <span>{missing.name}</span>
              <strong>{price(missing.price)}</strong>
            </div>
          </div>
          <div className="booking-actions">
            <button className="booking-btn is-primary" onClick={() => props.onView('ordered')}>
              Buy now
            </button>
            <button className="booking-btn" onClick={() => props.onView('substitutes')}>
              Find substitutes
            </button>
          </div>
        </>
      )}
    </div>
  )
}
