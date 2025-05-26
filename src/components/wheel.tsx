import React, { useRef } from "react"
import {
  KeenSliderOptions,
  TrackDetails,
  useKeenSlider,
} from "keen-slider/react"

interface WheelProps {
  initIdx?: number
  label?: string
  length: number
  loop?: boolean
  perspective?: "left" | "right" | "center"
  /** Called with (relativeIndex, absoluteIndex) on every change */
  onSelect?: (relative: number, absolute: number) => void
  /** Return the display value for each slide */
  setValue?: (relative: number, absolute: number) => string
  width: number
}

export const Wheel: React.FC<WheelProps> = ({
  initIdx = 0,
  label,
  length: slides,
  loop = false,
  perspective = "center",
  setValue,
  onSelect,
  width,
}) => {
  const wheelSize = 20
  const slideDegree = 360 / wheelSize
  const slidesPerView = loop ? 9 : 1

  const [sliderState, setSliderState] = React.useState<TrackDetails | null>(null)
  const size = useRef(0)

  const options = useRef<KeenSliderOptions>({
    slides: {
      number: slides,
      origin: loop ? "center" : "auto",
      perView: slidesPerView,
    },
    vertical: true,
    initial: initIdx,
    loop,
    dragSpeed: (val) => {
      const height = size.current
      return (
        val *
        (height /
          ((height / 2) * Math.tan(slideDegree * (Math.PI / 180))) /
          slidesPerView)
      )
    },
    created: (s) => {
      size.current = s.size
    },
    updated: (s) => {
      size.current = s.size
    },
    detailsChanged: (s) => {
      const details = s.track.details
      setSliderState(details)
      // compute the “current” index in [0..slides-1]
      const absIdx = ((details.abs % slides) + slides) % slides
      const rel = details.slides[absIdx].relative
      onSelect?.(rel, details.abs)
    },
    rubberband: !loop,
    mode: "free-snap",
  })

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(options.current)
  const [radius, setRadius] = React.useState(0)

  React.useEffect(() => {
    if (slider.current) setRadius(slider.current.size / 2)
  }, [slider])

  const slideList = React.useMemo(() => {
    if (!sliderState) return []
    const offset = loop ? 1 / 2 - 1 / slidesPerView / 2 : 0
    return sliderState.slides.map((slide, i) => {
      const distance = (slide.distance - offset) * slidesPerView
      const rotate =
        Math.abs(distance) > wheelSize / 2
          ? 180
          : distance * (360 / wheelSize) * -1
      const style = {
        transform: `rotateX(${rotate}deg) translateZ(${radius}px)`,
        WebkitTransform: `rotateX(${rotate}deg) translateZ(${radius}px)`,
      }
      return {
        style,
        value: setValue ? setValue(i, sliderState.abs + Math.round(distance)) : String(i),
      }
    })
  }, [sliderState, radius, loop, setValue])

  return (
    <div
      className={`wheel keen-slider wheel--perspective-${perspective}`}
      ref={sliderRef}
    >
      <div
        className="wheel__shadow-top"
        style={{ transform: `translateZ(${radius}px)` }}
      />
      <div className="wheel__inner">
        <div className="wheel__slides" style={{ width: `${width}px` }}>
          {slideList.map(({ style, value }, idx) => (
            <div className="wheel__slide" style={style} key={idx}>
              <span>{value}</span>
            </div>
          ))}
        </div>
        {label && (
          <div
            className="wheel__label"
            style={{ transform: `translateZ(${radius}px)` }}
          >
            {label}
          </div>
        )}
      </div>
      <div
        className="wheel__shadow-bottom"
        style={{ transform: `translateZ(${radius}px)` }}
      />
    </div>
  )
}

export default Wheel
