import { styled, TextField } from '@mui/material';

const SearchInputWrapper = styled(TextField)(
    ({ theme }) => `
  .MuiInputBase-input {
      font-size: ${theme.typography.pxToRem(15)};
      color: white;
  }
`
);

export default SearchInputWrapper;
