const getElement = (search, elements, mapper = x => x) =>
  elements[
    Array.from(elements)
      .map(mapper)
      .findIndex(x => x === search || x.id === search || x.name === search)
  ]

export { getElement }
