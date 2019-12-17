const __ = require('config').universalPath
const _ = __.require('builders', 'utils')

const Bookshelf = __.require('models', 'bookshelf')
const promises_ = __.require('lib', 'promises')
const items_ = __.require('controllers', 'items/lib/items')
const db = __.require('couch', 'base')('bookshelves')
const itemDb = __.require('couch', 'base')('items')

const bookshelves_ = module.exports = {
  create: params => {
    const bookshelf = Bookshelf.create(params)
    return db.postAndReturn(bookshelf)
  },
  byIds: db.fetch,
  byIdsWithItems: ids => {
    return promises_.all([ bookshelves_.byIds(ids), fetchItems(ids) ])
    .spread(assignItemsToBookshelves(ids))
  },
  byOwners: ownersIds => {
    return db.viewByKeys('byOwners', ownersIds)
  },
  byOwnersWithItems: ownersIds => {
    return bookshelves_.byOwners(ownersIds)
    .then(bookshelves => {
      const ids = _.values(bookshelves).map(_.property('_id'))
      return bookshelves_.byIdsWithItems(ids)
    })
  },
  addItems: (ids, itemsIds, userId) => {
    return bookshelves_.byIds(ids)
    .then(items_.addBookshelves(itemsIds, userId))
    .then(() => {
      return bookshelves_.byIdsWithItems(ids)
    })
  },
  bulkDelete: db.bulkDelete,
  deleteItems: (ids, itemsIds, userId) => {
    return bookshelves_.byIds(ids)
    .then(items_.deleteBookshelves(itemsIds, userId))
    .then(() => {
      return bookshelves_.byIdsWithItems(ids)
    })
  },
  deleteBookshelvesItems: bookshelves => {
    const items = _.flatten(bookshelves.map(_.property('items')))
    return items_.bulkDelete(items)
  }
}

const fetchItems = bookshelvesIds => {
  return itemDb.viewByKeys('byBookshelves', bookshelvesIds)
}

const assignItemsToBookshelves = bookshelvesIds => (bookshelves, items) => {
  return bookshelves.map(bookshelf => {
    const bookshelfId = bookshelf._id
    const bookshelfItems = items.filter(item => {
      return item.bookshelves.includes(bookshelfId)
    })
    if (!bookshelf.items) { bookshelf.items = [] }
    bookshelf.items = bookshelf.items.concat(bookshelfItems)
    return bookshelf
  })
}
