import {createEventBus} from './core/event-bus.js';
import {createState} from './core/state.js';
import {asShikeError} from './core/errors.js';
import {normalizePage,listPages} from './core/router.js';
import {createLegacyRepository} from './storage/repository.js';
import {createMigrationRegistry} from './storage/migrations.js';
import {describeBackup} from './storage/backup.js';
import {createRecordService} from './records/record-service.js';
import {uniqueBy} from './records/dedupe.js';
import {isRepeatValue} from './records/recurrence.js';
import {parseWithLegacyParser} from './parser/parser-adapter.js';
import {recordsForDate} from './calendar/calendar-service.js';
import {buildCalendarWithLegacy} from './calendar/ics-export.js';
import {VIEW_NAMES,hasView} from './views/view-registry.js';
import {createLegacyComponents} from './components/legacy-components.js';
import {translate} from './i18n/index.js';
import {toDateKey} from './utilities/dates.js';
import {writeClipboard} from './utilities/clipboard.js';
import {createTextDownload} from './utilities/downloads.js';

const repository=createLegacyRepository();
const modules=Object.freeze({
  events:createEventBus(),state:createState({page:normalizePage('home')}),errors:{asShikeError},router:{normalizePage,listPages},repository,
  migrations:createMigrationRegistry(),backup:{describeBackup},records:createRecordService(repository),dedupe:{uniqueBy},recurrence:{isRepeatValue},
  parser:{parseWithLegacyParser},calendar:{recordsForDate,buildCalendarWithLegacy},views:{names:VIEW_NAMES,hasView},components:createLegacyComponents(),
  i18n:{translate},dates:{toDateKey},clipboard:{writeClipboard},downloads:{createTextDownload}
});

window.ShikeModules=modules;
window.dispatchEvent(new CustomEvent('shike:modules-ready',{detail:{version:window.APP_VERSION}}));
