/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 * POST    /api/things              ->  create
 * GET     /api/things/:name          ->  show
 * PUT     /api/things/:name          ->  upsert
 * PATCH   /api/things/:name          ->  patch
 * DELETE  /api/things/:name          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Item} from '../../sqldb';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Items
export function index(req, res) {
  return Item.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Item from the DB
export function show(req, res) {
  return Item.find({
    where: {
      name: req.params.name
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Item in the DB
export function create(req, res) {
  return Item.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Item in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.name) {
    Reflect.deleteProperty(req.body, 'name');
  }

  return Item.upsert(req.body, {
    where: {
      name: req.params.name
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Item in the DB
export function patch(req, res) {
  if(req.body.name) {
    Reflect.deleteProperty(req.body, 'name');
  }
  return Item.find({
    where: {
      name: req.params.name
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Item from the DB
export function destroy(req, res) {
  return Item.find({
    where: {
      name: req.params.name
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
