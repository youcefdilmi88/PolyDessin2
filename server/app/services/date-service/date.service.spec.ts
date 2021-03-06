import { expect } from 'chai';
import * as sinon from 'sinon';
import { testingContainer } from '../../../test/test-utils';
import { TYPES } from '../../types';
import { DateService } from './date.service';

describe('Date Service', () => {
    let dateService: DateService;
    let clock: sinon.SinonFakeTimers;

    beforeEach(async () => {
        const [container] = await testingContainer();
        dateService = container.get<DateService>(TYPES.DateService);
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('currenTime should return a valid message', async () => {
        const result = await dateService.currentTime();
        expect(result.title).to.equal('Time');
        expect(result.body).to.equal(new Date(0).toString());
    });

    it('currentTime should return different dates if called later', async () => {
        const { body: currentTime } = await dateService.currentTime();
        // tslint:disable-next-line:no-magic-numbers
        clock.tick(5000);
        const { body: now } = await dateService.currentTime();
        expect(new Date(currentTime)).to.be.below(new Date(now));
    });
});
