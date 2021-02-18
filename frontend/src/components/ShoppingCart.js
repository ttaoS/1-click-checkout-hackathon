import React from 'react';
import labelValueStyles from '../css/label-value.module.css';
import inputStyles from '../css/input-text.module.css';
import { Card, CardActionArea, CardContent, Typography, CardActions,Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const ShoppingCart = (props) => {
    const useStyles = makeStyles({
        root: {
          maxWidth: 345,
        },
        media: {
          height: 140,
        },
      });

      const classes = useStyles();
      
    const card = <Card className={classes.root}>
        <CardActionArea>
        <CardContent>
            <Typography gutterBottom variant="h2" component="h2">
            {props.data.name}
            </Typography>
            <span>
                SKU#: {props.data.sku}
            </span>
            <Typography variant="h4" color="textSecondary" component="p">
            Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
            across all continents except Antarctica
            </Typography>
        </CardContent>
        </CardActionArea>
        <CardActions>
        <Button size="small" color="primary">
            Share
        </Button>
        <Button size="small" color="primary">
            Learn More
        </Button>
        </CardActions>
    </Card>;

    const sku =
        <label>
            <span className={labelValueStyles.label}>sku</span>
            <input type='text'
                   name='sku'
                   value={props.data.sku}
                   className={inputStyles.root}
            />
        </label>;
    const name =
        <label>
            <span className={labelValueStyles.label}>name</span>
            <input type='text'
                   name='name'
                   value={props.data.name}
                   className={inputStyles.root}
            />
        </label>;

    const quantity =
        <label>
            <span className={labelValueStyles.label}>quantity</span>
            <input type='text'
                   name='quantity'
                   value={props.data.quantity}
                   className={inputStyles.root}
            />
        </label>;
    const price =
        <label>
            <span className={labelValueStyles.label}>price</span>
            <input type='text'
                   name='price'
                   value={props.data.price}
                   className={inputStyles.root}
            />
        </label>;

    return (
        <div>
            {card}
            {name}
            {sku}
            {quantity}
            {price}
            <br></br>
        </div>
    );
};

export default ShoppingCart;