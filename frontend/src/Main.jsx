import React from 'react';
import {
  // eslint-disable-next-line
  Root, Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useLocation } from '@happysanta/router';
import {
  views, panels, router, routes,
} from './router.js';

const onClick = (route) => () => router.pushPage(route);
const onBack = () => () => router.popPage();

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

const Main = () => {
  const location = useLocation();

  return (
    <Root activeView={location.getViewId()}>
      <View
        id={views.MAIN}
        onSwipeBack={onBack()}
        activePanel={location.getViewActivePanel(views.MAIN)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.MAIN}>
          <PanelHeader>Main</PanelHeader>
          <Group>
            <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
            <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
          </Group>
        </Panel>
      </View>
      <View
        id={views.KITTY}
        onSwipeBack={onBack()}
        activePanel={location.getViewActivePanel(views.KITTY)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.KITTY}>
          <PanelHeader>Hello Kitty</PanelHeader>
          <Group>
            <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
            <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
            <SimpleCell onClick={onBack()}>back</SimpleCell>
          </Group>
        </Panel>
      </View>
      <View
        id={views.WORLD}
        onSwipeBack={onBack()}
        activePanel={location.getViewActivePanel(views.WORLD)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.WORLD}>
          <PanelHeader>Hello World</PanelHeader>
          <Group>
            <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
            <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
            <SimpleCell onClick={onBack()}>back</SimpleCell>
          </Group>
        </Panel>
      </View>
    </Root>
  );
};

export default Main;
