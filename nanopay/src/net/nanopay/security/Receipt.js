foam.CLASS({
  package: 'net.nanopay.security',
  name: 'Receipt',

  documentation: `Modelled receipt class used for issuing receipts for objects
    stored in the Merkle Tree along with the signature for the top hash.`,

  properties: [
    {
      class: 'FObjectProperty',
      name: 'data',
      documentation: `Data object for which the receipt is being issued for.
        This is being stored in the leaf node.`
    },
    {
      class: 'String',
      name: 'signature',
      documentation: 'Hex encoded signature used for signing the root hash.'
    },
    {
      class: 'Object',
      javaType: 'byte[][]',
      name: 'path',
      documentation: `Path in the Merkle Tree to where the data is located.
        When following this path and combining the hashes, one should be able to
        re-create the Merkle Tree.`
    },
    {
      class: 'Int',
      name: 'dataIndex',
      documentation: `The index in the Merkle tree array of the data object.
        This is used to determine if the first hash in the path array is to be
        concatenanted to the left (even) or right (odd).`
    }
  ]
});
