const chai = require('chai');
const expect = chai.expect;
const Provider = require('../models/Provider');

describe('Provider Model', () => {
  it('should create a new provider', (done) => {
    const provider = new Provider({
      email: 'test@gmail.com',
      password: 'password'
    });
    provider.save((err) => {
      expect(err).to.be.null;
      expect(provider.email).to.equal('test@gmail.com');
      expect(provider).to.have.property('createdAt');
      expect(provider).to.have.property('updatedAt');
      done();
    });
  });

  it('should not create a provider with the unique email', (done) => {
    const provider = new Provider({
      email: 'test@gmail.com',
      password: 'password'
    });
    provider.save((err) => {
      expect(err).to.be.defined;
      expect(err.code).to.equal(11000);
      done();
    });
  });

  it('should find provider by email', (done) => {
    Provider.findOne({ email: 'test@gmail.com' }, (err, provider) => {
      expect(err).to.be.null;
      expect(provider.email).to.equal('test@gmail.com');
      done();
    });
  });

  it('should delete a provider', (done) => {
    Provider.remove({ email: 'test@gmail.com' }, (err) => {
      expect(err).to.be.null;
      done();
    });
  });
});
