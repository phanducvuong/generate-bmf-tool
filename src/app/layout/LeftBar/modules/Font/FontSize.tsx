import React, { FunctionComponent } from 'react'
import { observer } from 'mobx-react'
import Input from '@material-ui/core/Input'

import GridInput from 'src/app/components/GridInput/GridInput'

import { useFont } from 'src/store/hooks'

const FontSize: FunctionComponent<unknown> = () => {
  const { size, setSize } = useFont()

  const handleInput = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    setSize(Number(event.target.value))
  }

  return (
    <GridInput before='Font Size:' after='px'>
      <Input
        value={size}
        fullWidth
        type='number'
        inputProps={{ min: 1 }}
        onChange={handleInput}
      />
    </GridInput>
  )
}

export default observer(FontSize)
