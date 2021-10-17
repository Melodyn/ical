import React from 'react';
import {
  // eslint-disable-next-line
  Root, Epic, Tabbar, TabbarItem,
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import {
  Icon16ArrowTriangleDown,
  Icon16ArrowTriangleUp,
  Icon16Play,
  Icon16ChevronLeft,
} from '@vkontakte/icons';
import { useLocation } from '@happysanta/router';
import {
  views, panels, router, routes,
} from './router.js';

// const onClick = (route) => () => router.pushPage(route);
// const onBack = () => () => router.popPage();

// const Main = () => {
//   const location = useLocation();
//
//   return (
//     <View id={views.MAIN} activePanel={location.getViewActivePanel(views.MAIN)}>
//       <Panel id={panels.MAIN}>
//         <PanelHeader>Main</PanelHeader>
//         <Group>
//           <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
//           <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
//         </Group>
//       </Panel>
//       <Panel id={panels.KITTY}>
//         <PanelHeader>Hello Kitty</PanelHeader>
//         <Group>
//           <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
//           <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
//           <SimpleCell onClick={onBack()}>back</SimpleCell>
//         </Group>
//       </Panel>
//       <Panel id={panels.WORLD}>
//         <PanelHeader>Hello World</PanelHeader>
//         <Group>
//           <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
//           <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
//           <SimpleCell onClick={onBack()}>back</SimpleCell>
//         </Group>
//       </Panel>
//     </View>
//   );
// };

// const Main = () => {
//   const location = useLocation();
//
//   return (
//     <Root activeView={location.getViewId()}>
//       <View
//         id={views.MAIN}
//         onSwipeBack={onBack()}
//         activePanel={location.getViewActivePanel(views.MAIN)}
//         history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
//       >
//         <Panel id={panels.MAIN}>
//           <PanelHeader>Main</PanelHeader>
//           <Group>
//             <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
//             <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
//           </Group>
//         </Panel>
//       </View>
//       <View
//         id={views.KITTY}
//         onSwipeBack={onBack()}
//         activePanel={location.getViewActivePanel(views.KITTY)}
//         history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
//       >
//         <Panel id={panels.KITTY}>
//           <PanelHeader>Hello Kitty</PanelHeader>
//           <Group>
//             <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
//             <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
//             <SimpleCell onClick={onBack()}>back</SimpleCell>
//           </Group>
//         </Panel>
//       </View>
//       <View
//         id={views.WORLD}
//         onSwipeBack={onBack()}
//         activePanel={location.getViewActivePanel(views.WORLD)}
//         history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
//       >
//         <Panel id={panels.WORLD}>
//           <PanelHeader>Hello World</PanelHeader>
//           <Group>
//             <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
//             <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
//             <SimpleCell onClick={onBack()}>back</SimpleCell>
//           </Group>
//         </Panel>
//       </View>
//     </Root>
//   );
// };

const Main = () => {
  const location = useLocation();
  const viewId = location.getViewId();

  const onClick = (e) => router.pushPage(e.currentTarget.dataset.story);
  const onBack = () => router.popPage();

  return (
    <Epic
      activeStory={viewId}
      tabbar={(
        <Tabbar
          role="navigation"
        >
          <TabbarItem
            onClick={onClick}
            selected={viewId === views.MAIN}
            data-story={routes.MAIN}
            text="Home"
            role="button"
          >
            <Icon16Play width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onClick}
            selected={viewId === views.KITTY}
            data-story={routes.KITTY}
            text="Kitty"
            role="button"
          >
            <Icon16ArrowTriangleUp width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onClick}
            selected={viewId === views.WORLD}
            data-story={routes.WORLD}
            text="World"
            role="button"
          >
            <Icon16ArrowTriangleDown width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onBack}
            text="Back"
            role="button"
          >
            <Icon16ChevronLeft width={24} height={24} />
          </TabbarItem>
        </Tabbar>
    )}
    >
      <View
        id={views.MAIN}
        activePanel={location.getViewActivePanel(views.MAIN)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.MAIN}>
          <PanelHeader>Main</PanelHeader>
          <Group>
            <SimpleCell>Kitty</SimpleCell>
            <SimpleCell>World</SimpleCell>
          </Group>
        </Panel>
      </View>
      <View
        id={views.KITTY}
        activePanel={location.getViewActivePanel(views.KITTY)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.KITTY}>
          <PanelHeader>Hello Kitty</PanelHeader>
          <Group>
            <SimpleCell />
            <SimpleCell>H</SimpleCell>
            <SimpleCell>e</SimpleCell>
            <SimpleCell>l</SimpleCell>
            <SimpleCell>l</SimpleCell>
            <SimpleCell>o</SimpleCell>
            <SimpleCell />
            <SimpleCell />
            <SimpleCell>K</SimpleCell>
            <SimpleCell>i</SimpleCell>
            <SimpleCell>t</SimpleCell>
            <SimpleCell>t</SimpleCell>
            <SimpleCell>y</SimpleCell>
            <SimpleCell />
            <SimpleCell />
          </Group>
        </Panel>
      </View>
      <View
        id={views.WORLD}
        activePanel={location.getViewActivePanel(views.WORLD)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.WORLD}>
          <PanelHeader>Hello World</PanelHeader>
          <Group>
            <SimpleCell>{'World '.repeat(10)}</SimpleCell>
          </Group>
        </Panel>
      </View>
    </Epic>
  );
};

export default Main;
