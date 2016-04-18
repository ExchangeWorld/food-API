'use strict';

var Dish = require('../../models').Dish;
var Like = require('../../models').Like;
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var _ = require('lodash');



exports.destory = function(req, res) {

};

exports.update = function(req, res) {

};


/**
 * @api {post} /api/dish/like Like
 * @apiName dish.like
 * @apiGroup dish
 * @apiPermission Login
 * 
 * @apiDescription 
 *   Toggle dish like
 *   - already liked -> remove like
 *   - not yet liked -> add like
 *
 *
 * @apiParam {int} point score for this dish(usually = 1)
 * @apiParam {int} dish_id
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 error
 */
exports.like = function(req, res) {
    let point = parseInt(req.body.point, 10);
    let memberId = req.session.user.id;
    let dishId = parseInt(req.body.dish_id, 10);

    if (!dishId || !memberId || !point) {
        return res.status(400).json({
            msg: 'point, memberId, dishId must provided.'
        });
    }

    // find dish for sure that dishId is exist
    let _dish;
    Dish
        .findById(dishId)
        .then((dish)=> {
            if (!dish) {
                return res.status(400).json({
                    msg: 'dish not exist.'
                });
            }
            
            _dish = dish;

            return Like.find({
                member_id: memberId,
                dish_id: dishId
            });
        })
        .then((like)=> {
            if (like) {
                return like
                    .destroy()
                    .then(()=> {
                        return res.status(201).send();
                    })
                    .catch((err)=> {
                        console.error('dislike dish error: ', err);
                        return res.status(500).json({
                            msg: 'server error'
                        });
                    });
            }
             
            return Like.create({
                member_id: memberId,
                dish_id: dishId,
                point: point
            });
        })
        .then(()=> {
            _dish.score += point;
            _dish
                .save()
                .then(()=> { return res.status(201).send(); })
                .catch((err) => { console.error('save dish like error: ', err); });
        })
        .catch((err)=> {
            console.error('like dish error: ', err);
            res.status(500).json({
                msg: 'server error'
            });
        });
};
