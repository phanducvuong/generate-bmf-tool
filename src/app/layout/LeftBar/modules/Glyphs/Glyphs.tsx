import React, {
  useState,
  FunctionComponent,
  useCallback,
  useEffect,
} from 'react'

import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import { observer } from 'mobx-react'

import { useProject } from 'src/store/hooks'

const Glyphs: FunctionComponent<unknown> = () => {
  const { text, setText } = useProject()
  const [isIME, setIsIME] = useState(false)
  const [inputText, setInputText] = useState(text)

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const { value } = event.target
    const str = Array.from(new Set(value.split(''))).join('')
    if (isIME) {
      setInputText(value)
    } else {
      setInputText(str)
      if (str !== text) setText(str)
    }
  }

  const handleCompositionStart = useCallback((): void => {
    setInputText(text)
    setIsIME(true)
  }, [text])

  const handleCompositionEnd = (): void => {
    setIsIME(false)
    const str = Array.from(new Set(inputText.split(''))).join('')
    setInputText(str)
    if (str !== text) setText(str)
  }

  useEffect(() => {
    setInputText(text)
  }, [text])

  return (
    <>
      <Box paddingX={2} marginY={4}>
        <Typography>Glyphs</Typography>
      </Box>
      <Box paddingX={2} marginY={4}>
        <TextField
          margin='none'
          value={isIME ? inputText : text}
          fullWidth
          multiline
          rows={4}
          variant='outlined'
          inputProps={{ spellCheck: false }}
          onChange={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
      </Box>
    </>
  )
}

export default observer(Glyphs)
