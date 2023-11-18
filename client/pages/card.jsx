import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from 'react-bootstrap/Button';
import { experimentalStyled as styled } from '@mui/material/styles';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useState, useEffect } from "react";

export default function Card(props) {

  const [isCopied, setIsCopied] = useState(false);
  const [htmlElement, setHtmlElement] = useState(null);

  const Item = styled(Paper)(({ theme }) => ({
    display: 'flex',
    marginBottom: '8%',
    flexDirection: 'column',
    textAlign: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(3),
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#0d3b66',
  }));

  const Title = styled('div')(({ theme }) => ({
    ...theme.typography.button,
    ...theme.typography.h6,
    color: '#fff',
    fontWeight: 550,
    padding: theme.spacing(1),
    textAlign: 'center',
  }));

  const getMyDate = (date) => {
    var myDate = new Date(parseInt(date));
    return myDate.getDate() +
      "/" + (myDate.getMonth() + 1) +
      "/" + myDate.getFullYear() +
      " " + myDate.getHours() +
      ":" + myDate.getMinutes() +
      ":" + myDate.getSeconds();
  };

  const translateState = (state) => {
    switch (state) {
      case 0:
        return "Mint";
      case 1:
        return "Delivered";
      case 2:
        return "Accepted";
      case 3:
        return "Rejected";
      case 4:
        return "Used";
      case 5:
        return "On Sale";
      case 6:
        return "Bought";
    }
  };

  const translateRole = (role) => {
    switch (role) {
      case 0:
        return "Farmer";
      case 1:
        return "Baker";
      case 2:
        return "Customer";
    }
  }

  const handleCopyClick = () => {

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);

  }

  const getHtmlComponent = () => {

    const tokenData = props.data;

    return (
      <Item>
        <Title>
          {translateState(tokenData.operation)}
        </Title>
        <div style={{ display: "flex" }}>
          <Typography variant="subtitle1" color="white" noWrap>
            <strong>Time:</strong>
          </Typography>
          <Typography variant="subtitle1" color="white" noWrap>
            &nbsp;{getMyDate(tokenData.blockTimestamp)}
          </Typography>
        </div>
        {tokenData.operation == 0 ?
          <div>
            <div style={{ display: "flex" }}>
              <Typography variant="subtitle1" color="white" noWrap>
                <strong>Product:</strong>
              </Typography>
              <Typography variant="subtitle1" color="white" noWrap>
                &nbsp;{tokenData.attrs.quantity} {tokenData.attrs.unit} of {tokenData.attrs.product}
              </Typography>
            </div>
            <div style={{ display: "flex" }}>
              <Typography variant="subtitle1" color="white" noWrap>
                <strong>Origin:</strong>
              </Typography>
              <Typography variant="subtitle1" color="white" noWrap>
                &nbsp;{Number(tokenData.attrs.origin)}
              </Typography>
            </div>
            <div style={{ display: "flex" }}>
              <Typography variant="subtitle1" color="white" noWrap>
                <strong>State:</strong>
              </Typography>
              <Typography variant="subtitle1" color="white" noWrap>
                &nbsp;{translateState(tokenData.attrs.currentState)}
              </Typography>
            </div>
            <div style={{ display: "flex" }}>
              <Typography variant="subtitle1" color="white" noWrap>
                <strong>Manufacturer:</strong>
              </Typography>
              <Typography variant="subtitle1" color="white" noWrap>
                &nbsp;{tokenData.user.name}, {translateRole(tokenData.user.role)}
              </Typography>
            </div>
            <div style={{ display: "flex" }}>
              <Typography variant="subtitle1" color="white" noWrap>
                <strong>Made in:</strong>
              </Typography>
              <Typography variant="subtitle1" color="white" noWrap>
                &nbsp;{tokenData.user.location}
              </Typography>
            </div>
          </div>
          :
          <div style={{ display: "flex" }}>
            <Typography variant="subtitle1" color="white" noWrap>
              <strong>Responsible:</strong>
            </Typography>
            <Typography variant="subtitle1" color="white" noWrap>
              &nbsp;{tokenData.user.name}, {translateRole(tokenData.user.role)}
            </Typography>
          </div>
        }

        <Grid>
          <Typography variant="h6" color="white" component="p">
            Tx Data
          </Typography>
          <Typography variant="body2" color="white" component="p">
            Block Number: {tokenData.blockNumber}
          </Typography>
          <CopyToClipboard text={tokenData.txHash} onCopy={handleCopyClick}>
            <Button style={{ 'marginTop': '2%', 'marginBottom': '2%' }} variant="primary" >
              <Typography variant="body2" color="text.secondary.contrastText" component="p">
                {isCopied ? 'Copied!' : 'Copy Hash'}
              </Typography>
            </Button>
          </CopyToClipboard>
        </Grid>
      </Item>
    );
  }

  useEffect(() => {

    const resultHtml = getHtmlComponent();
    setHtmlElement(resultHtml);

  }, [props])

  return htmlElement;
}