import React, { useRef, useState, useEffect, FunctionComponent } from 'react'
import { observer } from 'mobx-react'
import { makeStyles, createStyles } from '@material-ui/core/styles'

import { useProject } from 'src/store/hooks'
import useWheel from 'src/app/hooks/useWheel'
import useSpaceDrag from 'src/app/hooks/useSpaceDrag'
import { BMFontChar, toBmfInfo } from 'src/file/export'

import getPreviewCanvas, { PreviewObject } from './getPreviewCanvas'
import LetterList from './LetterList'
import { autorun } from 'mobx'

interface StyleProps {
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
  dragState: number
}

const useStyles = makeStyles(({ bgPixel }) =>
  createStyles({
    root: {
      position: 'relative',
      flex: 1,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      ...bgPixel,
      cursor: (props: StyleProps) => {
        if (props.dragState === 2) return 'grabbing'
        if (props.dragState === 1) return 'grab'
        return 'default'
      },
    },
    wrap: {
      transformOrigin: '50% 50%',
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: (props: StyleProps) => `${props.width}px`,
      height: (props: StyleProps) => `${props.height}px`,
      marginLeft: (props: StyleProps) => `${props.width / -2}px`,
      marginTop: (props: StyleProps) => `${props.height / -2}px`,
      transform: (props: StyleProps) =>
        `scale(${props.scale}) translate(${props.offsetX}px,${props.offsetY}px)`,
    },
    canvas: {
      width: '100%',
      height: '100%',
      imageRendering: 'pixelated',
    },
  }),
)

const PreviewCanvas: FunctionComponent<unknown> = () => {
  const project = useProject()
  const [data, setData] = useState<PreviewObject | null>(null)
  const {
    ui,
    style: {
      font: {
        size,
        lineHeight,
        middle,
        hanging,
        top,
        alphabetic,
        ideographic,
        bottom,
        minBaseLine,
        maxBaseLine,
      },
    },
    layout: { padding },
    isPacking,
  } = project
  const { previewScale, previewOffsetX, previewOffsetY } = ui

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const domRef = useRef<HTMLDivElement>(null)
  const [dragState, handleMouseDown] = useSpaceDrag(
    (offsetInfo) => {
      const { offsetX: ix, offsetY: iy } = offsetInfo
      const {
        previewScale: os,
        previewOffsetX: ox,
        previewOffsetY: oy,
        setPreviewTransform,
      } = ui
      setPreviewTransform({
        previewOffsetX: ox + ix / os,
        previewOffsetY: oy + iy / os,
      })
    },
    [ui],
  )
  const classes = useStyles({
    width: data ? data.width : 0,
    height: data ? data.height : 0,
    scale: previewScale,
    offsetX: previewOffsetX,
    offsetY: previewOffsetY,
    dragState,
  })

  useWheel(
    domRef,
    (info) => {
      const {
        previewOffsetX: ox,
        previewOffsetY: oy,
        previewScale: os,
        setPreviewTransform,
      } = ui
      const s = os + info.deltaScale
      const x = ox + info.deltaX / s
      const y = oy + info.deltaY / s
      setPreviewTransform({
        previewOffsetX: x,
        previewOffsetY: y,
        previewScale: s,
      })
    },
    [ui],
  )

  useEffect(() => {
    if (!canvasRef.current || isPacking || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const lh = size * lineHeight

    canvas.width = data.width
    canvas.height = data.height
    data.list.forEach((item) => {
      if (!item.source || item.source.width === 0 || item.source.height === 0)
        return
      ctx.drawImage(item.source, item.x - data.xOffset, item.y - data.yOffset)
    })

    for (let index = 0; index < data.lines; index += 1) {
      ;[middle, hanging, top, alphabetic, ideographic, bottom].forEach(
        (baseLine) => {
          const basey = Math.round(baseLine - minBaseLine + index * lh)
          ctx.beginPath()
          ctx.moveTo(-data.xOffset, basey + 0.5 - data.yOffset)
          ctx.lineTo(data.width, basey + 0.5 - data.yOffset)
          if (baseLine === minBaseLine || baseLine === maxBaseLine) {
            ctx.strokeStyle = 'rgba(0,0,0,1)'
            ctx.setLineDash([])
          } else {
            ctx.strokeStyle = 'rgba(0,0,0,0.5)'
            ctx.setLineDash([10, 3, 2, 3])
          }
          ctx.stroke()
        },
      )
      ctx.beginPath()
      ctx.moveTo(-data.xOffset + 0.5, index * lh - data.yOffset)
      ctx.lineTo(
        -data.xOffset + 0.5,
        index * lh - data.yOffset + maxBaseLine - minBaseLine,
      )
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.setLineDash([])
      ctx.stroke()
    }
  }, [
    alphabetic,
    bottom,
    data,
    hanging,
    ideographic,
    isPacking,
    lineHeight,
    maxBaseLine,
    middle,
    minBaseLine,
    size,
    top,
  ])

  useEffect(() => {
    autorun(() => {
      if (!canvasRef.current || isPacking) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { chars, kernings } = toBmfInfo(project)
      const kerningMap: Map<number, Map<number, number>> = new Map()
      kernings.list.forEach(({ first, second, amount }) => {
        if (!kerningMap.has(first)) kerningMap.set(first, new Map())
        const k = kerningMap.get(first)
        k?.set(second, amount)
      })
      const charMap: Map<string, BMFontChar> = new Map()
      chars.list.forEach((char) => {
        charMap.set(char.letter, char)
      })
      const lh = size * lineHeight
      const obj = getPreviewCanvas(
        ui.previewText,
        charMap,
        kerningMap,
        lh,
        maxBaseLine - minBaseLine,
        padding,
      )
      setData(() => obj)
    })
  }, [
    isPacking,
    lineHeight,
    maxBaseLine,
    minBaseLine,
    project,
    size,
    ui.previewText,
    padding,
  ])

  return (
    <div
      aria-hidden
      ref={domRef}
      className={classes.root}
      onMouseDown={handleMouseDown}
      onClick={() => ui.setSelectLetter('', '')}
    >
      <div className={classes.wrap}>
        <canvas ref={canvasRef} className={classes.canvas} />
        {data ? <LetterList data={data} /> : null}
      </div>
    </div>
  )
}

export default observer(PreviewCanvas)
